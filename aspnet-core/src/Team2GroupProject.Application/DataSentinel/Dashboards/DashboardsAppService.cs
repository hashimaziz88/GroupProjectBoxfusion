using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.Dashboards.Dto;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.Dashboards
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Dashboard)]
    public class DashboardsAppService : Team2GroupProjectAppServiceBase, IDashboardsAppService
    {
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;

        public DashboardsAppService(
            IActivityEventRepository activityEventRepository,
            ISecurityAlertRepository securityAlertRepository,
            IUserRiskProfileRepository userRiskProfileRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IMonitoredTableRepository monitoredTableRepository)
        {
            _activityEventRepository = activityEventRepository;
            _securityAlertRepository = securityAlertRepository;
            _userRiskProfileRepository = userRiskProfileRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _monitoredTableRepository = monitoredTableRepository;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync(DashboardWindowInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var window = ResolveWindow(input.WindowDays);

            var alerts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.TriggeredAt >= window.WindowStartUtc)
                .Select(x => new { x.Severity, x.Status })
                .ToListAsync();

            var events = await _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.EventTime >= window.WindowStartUtc)
                .Select(x => new
                {
                    x.EventType,
                    x.IsSuccess,
                    x.IsOutOfHours,
                    x.Severity
                })
                .ToListAsync();

            var riskProfiles = await _userRiskProfileRepository.GetAll()
                .Where(x => x.TenantId == tenantId)
                .Select(x => new { x.RiskLevel, x.RiskScore })
                .ToListAsync();

            return new DashboardSummaryDto
            {
                WindowStartUtc = window.WindowStartUtc,
                WindowEndUtc = window.WindowEndUtc,
                TotalAlerts = alerts.Count,
                CriticalAlerts = alerts.Count(x => x.Severity == ActivitySeverity.Critical),
                NewAlerts = alerts.Count(x => x.Status == SecurityAlertStatus.New),
                TotalFailedAccessAttempts = events.Count(x => !x.IsSuccess),
                SuspiciousWriteActivityCount = events.Count(x => IsSuspiciousWriteActivity(
                    x.EventType,
                    x.Severity,
                    x.IsSuccess,
                    x.IsOutOfHours)),
                HighRiskUsersCount = riskProfiles.Count(x =>
                    x.RiskLevel >= UserRiskLevel.High || x.RiskScore >= 75)
            };
        }

        public async Task<DashboardActivityTrendsDto> GetActivityTrendsAsync(DashboardTrendInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var window = ResolveWindow(input.WindowDays);
            var bucketHours = NormalizeBucketHours(input.BucketHours);

            var events = await _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.EventTime >= window.WindowStartUtc)
                .Select(x => new { x.EventTime, x.EventType, x.IsSuccess })
                .ToListAsync();

            var alerts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.TriggeredAt >= window.WindowStartUtc)
                .Select(x => x.TriggeredAt)
                .ToListAsync();

            return new DashboardActivityTrendsDto
            {
                WindowStartUtc = window.WindowStartUtc,
                WindowEndUtc = window.WindowEndUtc,
                BucketHours = bucketHours,
                Reads = BuildTrendSeries(
                    window.WindowStartUtc,
                    window.WindowEndUtc,
                    bucketHours,
                    events.Where(x => x.EventType == ActivityEventType.Read)
                        .GroupBy(x => BucketUtc(x.EventTime, bucketHours))
                        .ToDictionary(x => x.Key, x => x.Count())),
                Writes = BuildTrendSeries(
                    window.WindowStartUtc,
                    window.WindowEndUtc,
                    bucketHours,
                    events.Where(x => IsWriteLike(x.EventType))
                        .GroupBy(x => BucketUtc(x.EventTime, bucketHours))
                        .ToDictionary(x => x.Key, x => x.Count())),
                FailedAccess = BuildTrendSeries(
                    window.WindowStartUtc,
                    window.WindowEndUtc,
                    bucketHours,
                    events.Where(x => !x.IsSuccess)
                        .GroupBy(x => BucketUtc(x.EventTime, bucketHours))
                        .ToDictionary(x => x.Key, x => x.Count())),
                Alerts = BuildTrendSeries(
                    window.WindowStartUtc,
                    window.WindowEndUtc,
                    bucketHours,
                    alerts.GroupBy(x => BucketUtc(x, bucketHours))
                        .ToDictionary(x => x.Key, x => x.Count()))
            };
        }

        public async Task<DashboardSeverityBreakdownDto> GetAlertsBySeverityAsync(DashboardWindowInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var window = ResolveWindow(input.WindowDays);

            var counts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.TriggeredAt >= window.WindowStartUtc)
                .GroupBy(x => x.Severity)
                .Select(x => new { Severity = x.Key, Count = x.Count() })
                .ToListAsync();

            return new DashboardSeverityBreakdownDto
            {
                WindowStartUtc = window.WindowStartUtc,
                WindowEndUtc = window.WindowEndUtc,
                Items = Enum.GetValues(typeof(ActivitySeverity))
                    .Cast<ActivitySeverity>()
                    .Select(severity => new DashboardSeverityPointDto
                    {
                        Severity = severity,
                        Count = counts.FirstOrDefault(x => x.Severity == severity)?.Count ?? 0
                    })
                    .ToList()
            };
        }

        public async Task<DashboardAnomalyTimelineDto> GetAnomalyTimelineAsync(DashboardTrendInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var window = ResolveWindow(input.WindowDays);
            var bucketHours = NormalizeBucketHours(input.BucketHours);

            var events = await _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.EventTime >= window.WindowStartUtc)
                .Select(x => new { x.EventTime, x.Severity, x.IsSuccess, x.IsOutOfHours })
                .ToListAsync();

            var alerts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.TriggeredAt >= window.WindowStartUtc)
                .Select(x => new { x.TriggeredAt, x.Severity })
                .ToListAsync();

            var suspiciousEvents = events
                .Where(x => IsSuspiciousEvent(x.Severity, x.IsSuccess, x.IsOutOfHours))
                .GroupBy(x => BucketUtc(x.EventTime, bucketHours))
                .ToDictionary(x => x.Key, x => x.Count());

            var alertCounts = alerts
                .GroupBy(x => BucketUtc(x.TriggeredAt, bucketHours))
                .ToDictionary(x => x.Key, x => x.Count());

            var highSeverityAlertCounts = alerts
                .Where(x => x.Severity >= ActivitySeverity.High)
                .GroupBy(x => BucketUtc(x.TriggeredAt, bucketHours))
                .ToDictionary(x => x.Key, x => x.Count());

            return new DashboardAnomalyTimelineDto
            {
                WindowStartUtc = window.WindowStartUtc,
                WindowEndUtc = window.WindowEndUtc,
                BucketHours = bucketHours,
                Items = BuildTimelineSeries(
                    window.WindowStartUtc,
                    window.WindowEndUtc,
                    bucketHours,
                    suspiciousEvents,
                    alertCounts,
                    highSeverityAlertCounts)
            };
        }

        public async Task<DashboardTopRiskDto> GetTopRiskyUsersAndEntitiesAsync(
            GetTopRiskyUsersAndEntitiesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var window = ResolveWindow(input.WindowDays);
            var maxUsers = NormalizeMaxCount(input.MaxUsers);
            var maxEntities = NormalizeMaxCount(input.MaxEntities);

            var users = await _userRiskProfileRepository.GetAll()
                .Where(x => x.TenantId == tenantId)
                .OrderByDescending(x => x.RiskScore)
                .ThenByDescending(x => x.HighSeverityAlertCount)
                .ThenByDescending(x => x.AlertCount)
                .Take(maxUsers)
                .ToListAsync();

            var alerts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.TriggeredAt >= window.WindowStartUtc)
                .Select(x => new
                {
                    x.DatabaseId,
                    x.TableId,
                    x.Severity,
                    x.TriggeredAt
                })
                .ToListAsync();

            var databaseIds = alerts
                .Where(x => x.DatabaseId.HasValue)
                .Select(x => x.DatabaseId.Value)
                .Distinct()
                .ToList();

            var tableIds = alerts
                .Where(x => x.TableId.HasValue)
                .Select(x => x.TableId.Value)
                .Distinct()
                .ToList();

            var databaseNames = await _monitoredDatabaseRepository.GetAll()
                .Where(x => x.TenantId == tenantId && databaseIds.Contains(x.Id))
                .Select(x => new { x.Id, x.Name })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

            var tableNames = await _monitoredTableRepository.GetAll()
                .Where(x => x.TenantId == tenantId && tableIds.Contains(x.Id))
                .Select(x => new { x.Id, x.Name })
                .ToDictionaryAsync(x => x.Id, x => x.Name);

            return new DashboardTopRiskDto
            {
                WindowStartUtc = window.WindowStartUtc,
                WindowEndUtc = window.WindowEndUtc,
                Users = users.Select(x => new DashboardRiskyUserDto
                {
                    ActorUser = x.ActorUser,
                    ActorIp = x.ActorIp,
                    RiskScore = x.RiskScore,
                    RiskLevel = x.RiskLevel,
                    AlertCount = x.AlertCount,
                    FailedLoginCount = x.FailedLoginCount,
                    PrivilegedActionCount = x.PrivilegedActionCount,
                    HighSeverityAlertCount = x.HighSeverityAlertCount,
                    OutOfHoursEventCount = x.OutOfHoursEventCount,
                    LastEvaluatedAt = x.LastEvaluatedAt
                }).ToList(),
                Databases = alerts
                    .Where(x => x.DatabaseId.HasValue)
                    .GroupBy(x => x.DatabaseId)
                    .Select(x => new DashboardRiskEntityDto
                    {
                        EntityId = x.Key,
                        Name = databaseNames.TryGetValue(x.Key!.Value, out var name)
                            ? name
                            : "Unknown database",
                        AlertCount = x.Count(),
                        HighSeverityAlertCount = x.Count(y => y.Severity >= ActivitySeverity.High),
                        LastAlertAtUtc = x.Max(y => y.TriggeredAt)
                    })
                    .OrderByDescending(x => x.HighSeverityAlertCount)
                    .ThenByDescending(x => x.AlertCount)
                    .Take(maxEntities)
                    .ToList(),
                Tables = alerts
                    .Where(x => x.TableId.HasValue)
                    .GroupBy(x => x.TableId)
                    .Select(x => new DashboardRiskEntityDto
                    {
                        EntityId = x.Key,
                        Name = tableNames.TryGetValue(x.Key!.Value, out var name)
                            ? name
                            : "Unknown table",
                        AlertCount = x.Count(),
                        HighSeverityAlertCount = x.Count(y => y.Severity >= ActivitySeverity.High),
                        LastAlertAtUtc = x.Max(y => y.TriggeredAt)
                    })
                    .OrderByDescending(x => x.HighSeverityAlertCount)
                    .ThenByDescending(x => x.AlertCount)
                    .Take(maxEntities)
                    .ToList()
            };
        }

        private static (DateTime WindowStartUtc, DateTime WindowEndUtc) ResolveWindow(int requestedDays)
        {
            var windowDays = Math.Clamp(requestedDays <= 0 ? 7 : requestedDays, 1, 90);
            var windowEndUtc = DateTime.UtcNow;
            var windowStartUtc = windowEndUtc.AddDays(-windowDays);
            return (windowStartUtc, windowEndUtc);
        }

        private static int NormalizeBucketHours(int requestedBucketHours)
        {
            return requestedBucketHours switch
            {
                <= 1 => 1,
                <= 6 => 6,
                <= 12 => 12,
                _ => 24
            };
        }

        private static int NormalizeMaxCount(int requestedCount)
        {
            return Math.Clamp(requestedCount <= 0 ? 5 : requestedCount, 1, 20);
        }

        private static DateTime BucketUtc(DateTime value, int bucketHours)
        {
            var utcValue = value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

            var bucketHour = (utcValue.Hour / bucketHours) * bucketHours;
            return new DateTime(
                utcValue.Year,
                utcValue.Month,
                utcValue.Day,
                bucketHour,
                0,
                0,
                DateTimeKind.Utc);
        }

        private static bool IsWriteLike(ActivityEventType eventType)
        {
            return eventType == ActivityEventType.Write ||
                   eventType == ActivityEventType.Delete ||
                   eventType == ActivityEventType.SchemaChange ||
                   eventType == ActivityEventType.PermissionChange ||
                   eventType == ActivityEventType.PrivilegedAction ||
                   eventType == ActivityEventType.BulkOperation;
        }

        private static bool IsSuspiciousWriteActivity(
            ActivityEventType eventType,
            ActivitySeverity severity,
            bool isSuccess,
            bool isOutOfHours)
        {
            return IsWriteLike(eventType) &&
                   (severity >= ActivitySeverity.High || !isSuccess || isOutOfHours);
        }

        private static bool IsSuspiciousEvent(
            ActivitySeverity severity,
            bool isSuccess,
            bool isOutOfHours)
        {
            return severity >= ActivitySeverity.High || !isSuccess || isOutOfHours;
        }

        private static List<DashboardTrendPointDto> BuildTrendSeries(
            DateTime windowStartUtc,
            DateTime windowEndUtc,
            int bucketHours,
            IReadOnlyDictionary<DateTime, int> counts)
        {
            var items = new List<DashboardTrendPointDto>();

            for (var bucket = BucketUtc(windowStartUtc, bucketHours);
                bucket <= windowEndUtc;
                bucket = bucket.AddHours(bucketHours))
            {
                items.Add(new DashboardTrendPointDto
                {
                    BucketStartUtc = bucket,
                    Count = counts.TryGetValue(bucket, out var count) ? count : 0
                });
            }

            return items;
        }

        private static List<DashboardAnomalyTimelinePointDto> BuildTimelineSeries(
            DateTime windowStartUtc,
            DateTime windowEndUtc,
            int bucketHours,
            IReadOnlyDictionary<DateTime, int> suspiciousEvents,
            IReadOnlyDictionary<DateTime, int> alertCounts,
            IReadOnlyDictionary<DateTime, int> highSeverityAlertCounts)
        {
            var items = new List<DashboardAnomalyTimelinePointDto>();

            for (var bucket = BucketUtc(windowStartUtc, bucketHours);
                bucket <= windowEndUtc;
                bucket = bucket.AddHours(bucketHours))
            {
                items.Add(new DashboardAnomalyTimelinePointDto
                {
                    BucketStartUtc = bucket,
                    SuspiciousEventCount = suspiciousEvents.TryGetValue(bucket, out var eventCount)
                        ? eventCount
                        : 0,
                    AlertCount = alertCounts.TryGetValue(bucket, out var alertCount)
                        ? alertCount
                        : 0,
                    HighSeverityAlertCount = highSeverityAlertCounts.TryGetValue(
                        bucket,
                        out var highSeverityCount)
                        ? highSeverityCount
                        : 0
                });
            }

            return items;
        }
    }
}
