using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Auditing;
using Abp.Timing;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.DataSentinel.RulesetEngine
{
    public class RulesetEngineAppService : Team2GroupProjectAppServiceBase, IRulesetEngineAppService
    {
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;

        public RulesetEngineAppService(
            IActivityEventRepository activityEventRepository,
            IAlertRuleRepository alertRuleRepository,
            ISecurityAlertRepository securityAlertRepository)
        {
            _activityEventRepository = activityEventRepository;
            _alertRuleRepository = alertRuleRepository;
            _securityAlertRepository = securityAlertRepository;
        }

        [DisableAuditing]
        public async Task EvaluateAllRulesAsync(int tenantId)
        {
            var rules = await _alertRuleRepository.GetAllEnabledAsync(tenantId);

            foreach (var rule in rules)
            {
                await EvaluateRuleAsync(tenantId, rule);
            }
        }

        [DisableAuditing]
        public async Task EvaluateForEventAsync(int tenantId, Guid activityEventId)
        {
            var rules = await _alertRuleRepository.GetAllEnabledAsync(tenantId);

            foreach (var rule in rules)
            {
                await EvaluateRuleAsync(tenantId, rule, activityEventId);
            }
        }

        private async Task EvaluateRuleAsync(int tenantId, AlertRule rule, Guid? singleEventId = null)
        {
            var candidates = rule.RuleType switch
            {
                AlertRuleType.ThresholdBased => await EvaluateThresholdBasedAsync(tenantId, rule, singleEventId),
                AlertRuleType.RepeatedFailure => await EvaluateRepeatedFailureAsync(tenantId, rule, singleEventId),
                AlertRuleType.OutOfHours => await EvaluateOutOfHoursAsync(tenantId, rule, singleEventId),
                AlertRuleType.PrivilegedAction => await EvaluatePrivilegedActionAsync(tenantId, rule, singleEventId),
                AlertRuleType.BulkOperation => await EvaluateBulkOperationAsync(tenantId, rule, singleEventId),
                _ => new List<AlertCandidate>()
            };

            foreach (var candidate in candidates)
            {
                await CreateAlertIfNotDuplicateAsync(tenantId, rule, candidate);
            }
        }

        private async Task<List<AlertCandidate>> EvaluateThresholdBasedAsync(int tenantId, AlertRule rule, Guid? singleEventId)
        {
            var windowStart = Clock.Now.AddMinutes(-rule.WindowMinutes);
            var windowEnd = Clock.Now;

            var query = _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.EventTime >= windowStart);

            if (rule.EventType.HasValue)
                query = query.Where(x => x.EventType == rule.EventType.Value);

            var candidates = new List<AlertCandidate>();

            if (!rule.GroupByField.HasValue)
            {
                var count = await query.CountAsync();
                if (count >= rule.ThresholdCount)
                {
                    var topActor = await query
                        .GroupBy(x => x.ActorUser)
                        .OrderByDescending(g => g.Count())
                        .Select(g => g.Key)
                        .FirstOrDefaultAsync();

                    candidates.Add(new AlertCandidate
                    {
                        Title = Truncate($"{rule.Name} — threshold exceeded", DataSentinelConsts.AlertTitleMaxLength),
                        Summary = Truncate($"{count} {rule.EventType?.ToString() ?? "events"} by all actors in {rule.WindowMinutes} minutes", DataSentinelConsts.AlertSummaryMaxLength),
                        PrimaryActorUser = topActor,
                        EventTimeStart = windowStart,
                        EventTimeEnd = windowEnd,
                        RelatedEventCount = count
                    });
                }

                return candidates;
            }

            if (rule.GroupByField.Value == AlertRuleGroupByField.DatabaseId)
            {
                var groups = await query
                    .GroupBy(x => x.DatabaseId)
                    .Where(g => g.Count() >= rule.ThresholdCount)
                    .Select(g => new { Key = g.Key, Count = g.Count(), TopActor = g.Select(x => x.ActorUser).FirstOrDefault() })
                    .ToListAsync();

                foreach (var g in groups)
                {
                    candidates.Add(new AlertCandidate
                    {
                        Title = Truncate($"{rule.Name} — threshold exceeded", DataSentinelConsts.AlertTitleMaxLength),
                        Summary = Truncate($"{g.Count} {rule.EventType?.ToString() ?? "events"} by {g.Key?.ToString() ?? "all actors"} in {rule.WindowMinutes} minutes", DataSentinelConsts.AlertSummaryMaxLength),
                        PrimaryActorUser = g.TopActor,
                        DatabaseId = g.Key,
                        EventTimeStart = windowStart,
                        EventTimeEnd = windowEnd,
                        RelatedEventCount = g.Count
                    });
                }
            }
            else
            {
                var grouped = rule.GroupByField.Value switch
                {
                    AlertRuleGroupByField.ActorIp => query.GroupBy(x => x.ActorIp),
                    AlertRuleGroupByField.ObjectName => query.GroupBy(x => x.ObjectName),
                    _ => query.GroupBy(x => x.ActorUser)
                };

                var groups = await grouped
                    .Where(g => g.Count() >= rule.ThresholdCount)
                    .Select(g => new { Key = g.Key, Count = g.Count(), TopActor = g.Select(x => x.ActorUser).FirstOrDefault() })
                    .ToListAsync();

                foreach (var g in groups)
                {
                    candidates.Add(new AlertCandidate
                    {
                        Title = Truncate($"{rule.Name} — threshold exceeded", DataSentinelConsts.AlertTitleMaxLength),
                        Summary = Truncate($"{g.Count} {rule.EventType?.ToString() ?? "events"} by {g.Key ?? "all actors"} in {rule.WindowMinutes} minutes", DataSentinelConsts.AlertSummaryMaxLength),
                        PrimaryActorUser = rule.GroupByField == AlertRuleGroupByField.ActorUser ? g.Key : g.TopActor,
                        PrimaryActorIp = rule.GroupByField == AlertRuleGroupByField.ActorIp ? g.Key : null,
                        EventTimeStart = windowStart,
                        EventTimeEnd = windowEnd,
                        RelatedEventCount = g.Count
                    });
                }
            }

            return candidates;
        }

        private async Task<List<AlertCandidate>> EvaluateRepeatedFailureAsync(int tenantId, AlertRule rule, Guid? singleEventId)
        {
            var windowStart = Clock.Now.AddMinutes(-rule.WindowMinutes);
            var windowEnd = Clock.Now;

            var query = _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.EventTime >= windowStart)
                .Where(x => !x.IsSuccess);

            if (rule.EventType.HasValue)
                query = query.Where(x => x.EventType == rule.EventType.Value);

            var groupField = rule.GroupByField ?? AlertRuleGroupByField.ActorUser;
            var candidates = new List<AlertCandidate>();

            if (groupField == AlertRuleGroupByField.ActorIp)
            {
                var groups = await query
                    .GroupBy(x => x.ActorIp)
                    .Where(g => g.Count() >= rule.ThresholdCount)
                    .Select(g => new { Key = g.Key, Count = g.Count() })
                    .ToListAsync();

                foreach (var g in groups)
                {
                    candidates.Add(new AlertCandidate
                    {
                        Title = Truncate($"{rule.Name} — repeated failures detected", DataSentinelConsts.AlertTitleMaxLength),
                        Summary = Truncate($"{g.Count} failed attempts by {g.Key} in {rule.WindowMinutes} minutes", DataSentinelConsts.AlertSummaryMaxLength),
                        PrimaryActorIp = g.Key,
                        EventTimeStart = windowStart,
                        EventTimeEnd = windowEnd,
                        RelatedEventCount = g.Count
                    });
                }
            }
            else
            {
                var groups = await query
                    .GroupBy(x => x.ActorUser)
                    .Where(g => g.Count() >= rule.ThresholdCount)
                    .Select(g => new { Key = g.Key, Count = g.Count() })
                    .ToListAsync();

                foreach (var g in groups)
                {
                    candidates.Add(new AlertCandidate
                    {
                        Title = Truncate($"{rule.Name} — repeated failures detected", DataSentinelConsts.AlertTitleMaxLength),
                        Summary = Truncate($"{g.Count} failed attempts by {g.Key} in {rule.WindowMinutes} minutes", DataSentinelConsts.AlertSummaryMaxLength),
                        PrimaryActorUser = g.Key,
                        EventTimeStart = windowStart,
                        EventTimeEnd = windowEnd,
                        RelatedEventCount = g.Count
                    });
                }
            }

            return candidates;
        }

        private async Task<List<AlertCandidate>> EvaluateOutOfHoursAsync(int tenantId, AlertRule rule, Guid? singleEventId)
        {
            var baseQuery = _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId);

            if (singleEventId.HasValue)
            {
                baseQuery = baseQuery.Where(x => x.Id == singleEventId.Value);
            }
            else
            {
                var catchUpStart = Clock.Now.AddHours(-24);
                baseQuery = baseQuery.Where(x => x.EventTime >= catchUpStart);
            }

            if (rule.EventType.HasValue)
            {
                baseQuery = baseQuery.Where(x => x.EventType == rule.EventType.Value && x.IsOutOfHours);
            }
            else
            {
                var sensitiveTypes = new[]
                {
                    ActivityEventType.Write,
                    ActivityEventType.Delete,
                    ActivityEventType.PrivilegedAction,
                    ActivityEventType.PermissionChange,
                    ActivityEventType.SchemaChange,
                    ActivityEventType.BulkOperation
                };
                baseQuery = baseQuery.Where(x => x.IsOutOfHours && sensitiveTypes.Contains(x.EventType));
            }

            var events = await baseQuery
                .Select(x => new
                {
                    x.Id,
                    x.ActorUser,
                    x.ActorIp,
                    x.EventTime,
                    x.EventType,
                    x.DatabaseId,
                    x.ServerId
                })
                .ToListAsync();

            var candidates = new List<AlertCandidate>();

            foreach (var x in events)
            {
                candidates.Add(new AlertCandidate
                {
                    TriggeringEventId = x.Id,
                    Title = Truncate($"{rule.Name} \u2014 out-of-hours {x.EventType} activity", DataSentinelConsts.AlertTitleMaxLength),
                    Summary = Truncate($"{x.ActorUser ?? "unknown"} performed {x.EventType} outside business hours at {x.EventTime:yyyy-MM-dd HH:mm} UTC", DataSentinelConsts.AlertSummaryMaxLength),
                    PrimaryActorUser = x.ActorUser,
                    PrimaryActorIp = x.ActorIp,
                    EventTimeStart = x.EventTime,
                    EventTimeEnd = x.EventTime,
                    RelatedEventCount = 1,
                    DatabaseId = x.DatabaseId,
                    ServerId = x.ServerId
                });
            }

            return candidates;
        }

        private async Task<List<AlertCandidate>> EvaluatePrivilegedActionAsync(int tenantId, AlertRule rule, Guid? singleEventId)
        {
            var baseQuery = _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId);

            if (singleEventId.HasValue)
            {
                baseQuery = baseQuery.Where(x => x.Id == singleEventId.Value);
            }
            else
            {
                var catchUpStart = Clock.Now.AddHours(-24);
                baseQuery = baseQuery.Where(x => x.EventTime >= catchUpStart);
            }

            if (rule.EventType.HasValue)
            {
                baseQuery = baseQuery.Where(x => x.EventType == rule.EventType.Value);
            }
            else
            {
                baseQuery = baseQuery.Where(x =>
                    x.EventType == ActivityEventType.PrivilegedAction ||
                    x.EventType == ActivityEventType.PermissionChange);
            }

            var events = await baseQuery
                .Select(x => new
                {
                    x.Id,
                    x.ActorUser,
                    x.ActorIp,
                    x.EventTime,
                    x.EventType,
                    x.DatabaseId,
                    x.ServerId
                })
                .ToListAsync();

            var candidates = new List<AlertCandidate>();

            foreach (var x in events)
            {
                candidates.Add(new AlertCandidate
                {
                    TriggeringEventId = x.Id,
                    Title = Truncate($"{rule.Name} \u2014 privileged action recorded", DataSentinelConsts.AlertTitleMaxLength),
                    Summary = Truncate($"{x.ActorUser ?? "unknown"} performed {x.EventType} at {x.EventTime:yyyy-MM-dd HH:mm} UTC", DataSentinelConsts.AlertSummaryMaxLength),
                    PrimaryActorUser = x.ActorUser,
                    PrimaryActorIp = x.ActorIp,
                    EventTimeStart = x.EventTime,
                    EventTimeEnd = x.EventTime,
                    RelatedEventCount = 1,
                    DatabaseId = x.DatabaseId,
                    ServerId = x.ServerId
                });
            }

            return candidates;
        }

        private async Task<List<AlertCandidate>> EvaluateBulkOperationAsync(int tenantId, AlertRule rule, Guid? singleEventId)
        {
            var baseQuery = _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId);

            if (singleEventId.HasValue)
            {
                baseQuery = baseQuery.Where(x => x.Id == singleEventId.Value);
            }
            else
            {
                var catchUpStart = Clock.Now.AddHours(-24);
                baseQuery = baseQuery.Where(x => x.EventTime >= catchUpStart);
            }

            var query = baseQuery.Where(x =>
                x.RowsAffected.HasValue &&
                x.RowsAffected.Value >= rule.ThresholdCount);

            if (rule.EventType.HasValue)
                query = query.Where(x => x.EventType == rule.EventType.Value);

            var events = await query
                .Select(x => new
                {
                    x.Id,
                    x.ActorUser,
                    x.ActorIp,
                    x.EventTime,
                    x.EventType,
                    x.RowsAffected,
                    x.ObjectName,
                    x.DatabaseId,
                    x.ServerId
                })
                .ToListAsync();

            var candidates = new List<AlertCandidate>();

            foreach (var x in events)
            {
                candidates.Add(new AlertCandidate
                {
                    TriggeringEventId = x.Id,
                    Title = Truncate($"{rule.Name} — bulk operation detected", DataSentinelConsts.AlertTitleMaxLength),
                    Summary = Truncate($"{x.ActorUser ?? "unknown"} affected {x.RowsAffected} rows on {x.ObjectName ?? "unknown object"} at {x.EventTime:yyyy-MM-dd HH:mm} UTC", DataSentinelConsts.AlertSummaryMaxLength),
                    PrimaryActorUser = x.ActorUser,
                    PrimaryActorIp = x.ActorIp,
                    EventTimeStart = x.EventTime,
                    EventTimeEnd = x.EventTime,
                    RelatedEventCount = 1,
                    DatabaseId = x.DatabaseId,
                    ServerId = x.ServerId
                });
            }

            return candidates;
        }

        private static string Truncate(string value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;
            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }

        private Task CreateAlertIfNotDuplicateAsync(int tenantId, AlertRule rule, AlertCandidate candidate)
            => Task.CompletedTask;
    }
}
