using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Dashboard)]
    public class DashboardsAppService : Team2GroupProjectAppServiceBase, IDashboardsAppService
    {
        private readonly IRepository<SecurityAlert, long> _securityAlertRepository;
        private readonly IRepository<ActivityEvent, long> _activityEventRepository;
        private readonly IRepository<AlertRule, long> _alertRuleRepository;
        private readonly IRepository<MonitoredServer, long> _monitoredServerRepository;
        private readonly IRepository<MonitoredDatabase, long> _monitoredDatabaseRepository;

        public DashboardsAppService(
            IRepository<SecurityAlert, long> securityAlertRepository,
            IRepository<ActivityEvent, long> activityEventRepository,
            IRepository<AlertRule, long> alertRuleRepository,
            IRepository<MonitoredServer, long> monitoredServerRepository,
            IRepository<MonitoredDatabase, long> monitoredDatabaseRepository)
        {
            _securityAlertRepository = securityAlertRepository;
            _activityEventRepository = activityEventRepository;
            _alertRuleRepository = alertRuleRepository;
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
        }

        public async Task<DashboardOverviewDto> GetOverviewAsync(GetDashboardOverviewInput input)
        {
            input ??= new GetDashboardOverviewInput();
            var tenantId = GetTenantId();
            var windowDays = input.WindowDays <= 0 ? 7 : Math.Min(input.WindowDays, 30);
            var utcNow = DateTime.UtcNow;
            var alertWindowStart = utcNow.Date.AddDays(-(windowDays - 1));
            var activityWindowStart = utcNow.AddHours(-24);

            var alerts = await (
                from alert in _securityAlertRepository.GetAll()
                join rule in _alertRuleRepository.GetAll() on alert.RuleId equals rule.Id
                where alert.TenantId == tenantId &&
                      rule.TenantId == tenantId &&
                      alert.CreationTime >= alertWindowStart
                select new DashboardAlertProjection
                {
                    Id = alert.Id,
                    Title = alert.Title,
                    Severity = alert.Severity,
                    Status = alert.Status,
                    CreationTime = alert.CreationTime,
                    LastModificationTime = alert.LastModificationTime,
                    PrimaryActorUser = alert.PrimaryActorUser,
                    PrimaryActorIp = alert.PrimaryActorIp,
                    RuleName = rule.Name
                }).ToListAsync();

            var activityEvents = await _activityEventRepository.GetAll()
                .Where(activityEvent => activityEvent.TenantId == tenantId && activityEvent.EventTime >= activityWindowStart)
                .Select(activityEvent => new DashboardActivityProjection
                {
                    ActorUser = activityEvent.ActorUser,
                    EventTime = activityEvent.EventTime,
                    EventType = activityEvent.EventType,
                    IsSuccessful = activityEvent.IsSuccessful,
                    IsOutOfHours = activityEvent.IsOutOfHours,
                    IsPrivilegedAction = activityEvent.IsPrivilegedAction,
                    RowsAffected = activityEvent.RowsAffected,
                    Severity = activityEvent.Severity
                })
                .ToListAsync();

            var alertsBySeverity = Enum.GetValues(typeof(AlertSeverity))
                .Cast<AlertSeverity>()
                .Select(severity => new DashboardSeverityCountDto
                {
                    Severity = severity,
                    Count = alerts.Count(item => item.Severity == severity)
                })
                .Where(item => item.Count > 0)
                .OrderByDescending(item => item.Severity)
                .ToList();

            var alertsByStatus = Enum.GetValues(typeof(SecurityAlertStatus))
                .Cast<SecurityAlertStatus>()
                .Select(status => new DashboardStatusCountDto
                {
                    Status = status,
                    Count = alerts.Count(item => item.Status == status)
                })
                .Where(item => item.Count > 0)
                .OrderBy(item => item.Status)
                .ToList();

            var anomalyTrend = Enumerable.Range(0, windowDays)
                .Select(offset => alertWindowStart.Date.AddDays(offset))
                .Select(date => new DashboardTrendPointDto
                {
                    Label = date.ToString("MMM dd"),
                    Count = alerts.Count(item => item.CreationTime.Date == date.Date)
                })
                .ToList();

            var activitySeries = Enumerable.Range(0, 6)
                .Select(offset =>
                {
                    var bucketStart = activityWindowStart.AddHours(offset * 4);
                    var bucketEnd = bucketStart.AddHours(4);
                    var bucketEvents = activityEvents
                        .Where(activityEvent => activityEvent.EventTime >= bucketStart && activityEvent.EventTime < bucketEnd)
                        .ToList();

                    return new DashboardActivityPointDto
                    {
                        Label = bucketStart.ToString("HH:mm"),
                        Reads = bucketEvents.Count(activityEvent =>
                            activityEvent.EventType == ActivityEventType.DataRead ||
                            activityEvent.EventType == ActivityEventType.Query ||
                            activityEvent.EventType == ActivityEventType.Export),
                        Writes = bucketEvents.Count(activityEvent =>
                            activityEvent.EventType == ActivityEventType.DataWrite ||
                            activityEvent.EventType == ActivityEventType.SchemaChange ||
                            activityEvent.EventType == ActivityEventType.PermissionChange),
                        FailedLogins = bucketEvents.Count(activityEvent =>
                            activityEvent.EventType == ActivityEventType.Login &&
                            !activityEvent.IsSuccessful)
                    };
                })
                .ToList();

            var riskProfiles = BuildActorRiskProfiles(alerts, activityEvents);

            return new DashboardOverviewDto
            {
                ActiveAlertCount = alerts.Count(item =>
                    item.Status != SecurityAlertStatus.Resolved &&
                    item.Status != SecurityAlertStatus.FalsePositive),
                CriticalAlertCount = alerts.Count(item => item.Severity == AlertSeverity.Critical),
                InProgressAlertCount = alerts.Count(item =>
                    item.Status == SecurityAlertStatus.InProgress ||
                    item.Status == SecurityAlertStatus.Triaged),
                ResolvedTodayCount = alerts.Count(item =>
                    item.Status == SecurityAlertStatus.Resolved &&
                    item.LastModificationTime.HasValue &&
                    item.LastModificationTime.Value.Date == utcNow.Date),
                TotalEventCount = activityEvents.Count,
                FailedLoginCount = activityEvents.Count(activityEvent =>
                    activityEvent.EventType == ActivityEventType.Login &&
                    !activityEvent.IsSuccessful),
                PrivilegedActionCount = activityEvents.Count(activityEvent => activityEvent.IsPrivilegedAction),
                LargeReadEventCount = activityEvents.Count(activityEvent =>
                    (activityEvent.EventType == ActivityEventType.DataRead || activityEvent.EventType == ActivityEventType.Export) &&
                    activityEvent.RowsAffected.GetValueOrDefault() >= 1000),
                MonitoredServerCount = await _monitoredServerRepository.CountAsync(server => server.TenantId == tenantId && server.IsActive),
                MonitoredDatabaseCount = await _monitoredDatabaseRepository.CountAsync(database => database.TenantId == tenantId && database.IsActive),
                EnabledRuleCount = await _alertRuleRepository.CountAsync(rule => rule.TenantId == tenantId && rule.IsEnabled),
                AlertsBySeverity = alertsBySeverity,
                AlertsByStatus = alertsByStatus,
                AnomalyTrend = anomalyTrend,
                ActivitySeries = activitySeries,
                TopRiskActors = riskProfiles
                    .OrderByDescending(profile => profile.RiskScore)
                    .ThenByDescending(profile => profile.AlertCount)
                    .ThenByDescending(profile => profile.EventCount)
                    .Take(5)
                    .ToList(),
                RecentAlerts = alerts
                    .OrderByDescending(item => item.CreationTime)
                    .Take(6)
                    .Select(item => new DashboardRecentAlertDto
                    {
                        Id = item.Id,
                        Title = item.Title,
                        Severity = item.Severity,
                        Status = item.Status,
                        ActorUser = string.IsNullOrWhiteSpace(item.PrimaryActorUser) ? item.PrimaryActorIp : item.PrimaryActorUser,
                        RuleName = item.RuleName,
                        RelativeHint = $"{Math.Max(1, (int)(utcNow - item.CreationTime).TotalMinutes)} min ago"
                    })
                    .ToList()
            };
        }

        private static List<DashboardRiskActorDto> BuildActorRiskProfiles(
            IReadOnlyCollection<DashboardAlertProjection> alerts,
            IReadOnlyCollection<DashboardActivityProjection> activityEvents)
        {
            var profiles = new Dictionary<string, DashboardRiskActorDto>(StringComparer.OrdinalIgnoreCase);

            foreach (var alert in alerts)
            {
                var actor = string.IsNullOrWhiteSpace(alert.PrimaryActorUser)
                    ? string.IsNullOrWhiteSpace(alert.PrimaryActorIp) ? "Unassigned actor" : alert.PrimaryActorIp
                    : alert.PrimaryActorUser;

                if (!profiles.TryGetValue(actor, out var profile))
                {
                    profile = new DashboardRiskActorDto
                    {
                        ActorUser = actor
                    };
                    profiles[actor] = profile;
                }

                profile.AlertCount += 1;
                profile.RiskScore += alert.Severity switch
                {
                    AlertSeverity.Critical => 45,
                    AlertSeverity.High => 30,
                    AlertSeverity.Medium => 18,
                    AlertSeverity.Low => 10,
                    _ => 5
                };
                if (string.IsNullOrWhiteSpace(profile.TopIndicator))
                {
                    profile.TopIndicator = alert.RuleName;
                }
            }

            foreach (var activityEvent in activityEvents)
            {
                var actor = string.IsNullOrWhiteSpace(activityEvent.ActorUser) ? "Unknown actor" : activityEvent.ActorUser;
                if (!profiles.TryGetValue(actor, out var profile))
                {
                    profile = new DashboardRiskActorDto
                    {
                        ActorUser = actor
                    };
                    profiles[actor] = profile;
                }

                profile.EventCount += 1;
                if (activityEvent.EventType == ActivityEventType.Login && !activityEvent.IsSuccessful)
                {
                    profile.RiskScore += 4;
                    profile.TopIndicator = "Repeated failed login attempts";
                }
                else if (activityEvent.IsPrivilegedAction)
                {
                    profile.RiskScore += 10;
                    profile.TopIndicator = "Privileged action activity";
                }
                else if (activityEvent.IsOutOfHours)
                {
                    profile.RiskScore += 6;
                    profile.TopIndicator = "Out-of-hours access";
                }
                else if (activityEvent.Severity == AlertSeverity.High || activityEvent.Severity == AlertSeverity.Critical)
                {
                    profile.RiskScore += 5;
                }
            }

            return profiles.Values.ToList();
        }

        private int GetTenantId()
        {
            return AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel dashboards require an active tenant context.");
        }

        private class DashboardAlertProjection
        {
            public long Id { get; set; }

            public string Title { get; set; }

            public AlertSeverity Severity { get; set; }

            public SecurityAlertStatus Status { get; set; }

            public DateTime CreationTime { get; set; }

            public DateTime? LastModificationTime { get; set; }

            public string PrimaryActorUser { get; set; }

            public string PrimaryActorIp { get; set; }

            public string RuleName { get; set; }
        }

        private class DashboardActivityProjection
        {
            public string ActorUser { get; set; }

            public DateTime EventTime { get; set; }

            public ActivityEventType EventType { get; set; }

            public bool IsSuccessful { get; set; }

            public bool IsOutOfHours { get; set; }

            public bool IsPrivilegedAction { get; set; }

            public int? RowsAffected { get; set; }

            public AlertSeverity Severity { get; set; }
        }
    }
}
