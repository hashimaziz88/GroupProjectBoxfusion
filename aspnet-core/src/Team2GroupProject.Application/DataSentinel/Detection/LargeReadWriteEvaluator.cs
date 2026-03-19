using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Extensions;
using Abp.UI;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Evaluates large read/write rules. This evaluator is responsible for
    /// rule loading, event querying, deduplication checks, alert insertion,
    /// and risk profile updates. SaveChangesAsync is owned by the orchestrator.
    /// </summary>
    public class LargeReadWriteEvaluator : ILargeReadWriteEvaluator, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="LargeReadWriteEvaluator"/> class.
        /// </summary>
        public LargeReadWriteEvaluator(
            IAlertRuleRepository alertRuleRepository,
            IActivityEventRepository activityEventRepository,
            ISecurityAlertRepository securityAlertRepository,
            IUserRiskProfileRepository userRiskProfileRepository)
        {
            _alertRuleRepository = alertRuleRepository;
            _activityEventRepository = activityEventRepository;
            _securityAlertRepository = securityAlertRepository;
            _userRiskProfileRepository = userRiskProfileRepository;
        }

        /// <summary>
        /// Evaluates large read/write rules for the supplied tenant.
        /// </summary>
        public Task<LargeReadWriteRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null)
        {
            var result = new LargeReadWriteRuleEvaluationResultDto
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            return EvaluateInternalAsync(tenantId, evaluationTimeUtc, ruleId, result);
        }

        /// <summary>
        /// Evaluates rules and fills the result object with persistence outcomes.
        /// </summary>
        private async Task<LargeReadWriteRuleEvaluationResultDto> EvaluateInternalAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId,
            LargeReadWriteRuleEvaluationResultDto result)
        {
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.LargeReadWrite);

            if (ruleId.HasValue)
            {
                rules = rules.Where(x => x.Id == ruleId.Value).ToList();
            }

            foreach (var rule in rules.OrderBy(x => x.Name))
            {
                if (!CanEvaluate(rule))
                {
                    result.SkippedRuleCount++;
                    continue;
                }

                result.EvaluatedRuleCount++;

                var windowStart = evaluationTimeUtc.AddMinutes(-rule.WindowMinutes);
                var matchingEvents = await _activityEventRepository.GetByTimeWindowAsync(
                    tenantId,
                    windowStart,
                    evaluationTimeUtc,
                    eventType: rule.EventType,
                    minRowsAffected: rule.ThresholdCount);

                var candidateGroups = BuildCandidateGroups(rule, matchingEvents);
                result.CandidateGroupCount += candidateGroups.Count;

                foreach (var candidateGroup in candidateGroups)
                {
                    var correlationKey = BuildCorrelationKey(rule, candidateGroup);
                    var existingAlert = await _securityAlertRepository.FindByCorrelationKeyAsync(tenantId, correlationKey);
                    if (existingAlert != null)
                    {
                        result.DuplicateAlertCount++;
                        continue;
                    }

                    var alert = BuildAlert(rule, candidateGroup, evaluationTimeUtc, correlationKey);
                    await _securityAlertRepository.InsertAsync(alert);
                    await UpdateRiskProfileAsync(tenantId, alert, evaluationTimeUtc);

                    result.CreatedAlertIds.Add(alert.Id);
                }
            }

            result.CreatedAlertCount = result.CreatedAlertIds.Count;
            return result;
        }

        /// <summary>
        /// Determines whether a rule can be evaluated by this evaluator.
        /// </summary>
        private static bool CanEvaluate(AlertRule rule)
        {
            try
            {
                rule.EnsureConfigurationIsValid();
            }
            catch (UserFriendlyException)
            {
                return false;
            }

            return rule.ThresholdCount > 0;
        }

        /// <summary>
        /// Builds threshold-qualified candidate groups from matching events.
        /// </summary>
        private static List<LargeReadWriteCandidateGroup> BuildCandidateGroups(AlertRule rule, IReadOnlyList<ActivityEvent> events)
        {
            IEnumerable<IGrouping<string, ActivityEvent>> groupedEvents;

            switch (rule.GroupByField)
            {
                case AlertRuleGroupByField.ActorUser:
                    groupedEvents = events.GroupBy(x => x.ActorUser ?? "unknown");
                    break;
                case AlertRuleGroupByField.ActorIp:
                    groupedEvents = events.GroupBy(x => x.ActorIp ?? "unknown");
                    break;
                case AlertRuleGroupByField.DatabaseId:
                    groupedEvents = events.GroupBy(x => x.DatabaseId?.ToString() ?? "unscoped");
                    break;
                case AlertRuleGroupByField.ObjectName:
                    groupedEvents = events.GroupBy(x => x.ObjectName ?? "unscoped");
                    break;
                default:
                    groupedEvents = events.GroupBy(_ => "ALL");
                    break;
            }

            return groupedEvents
                .Select(group =>
                {
                    var orderedEvents = group
                        .OrderBy(x => x.EventTime)
                        .ThenBy(x => x.Id)
                        .ToList();

                    return new LargeReadWriteCandidateGroup(rule.GroupByField, group.Key, orderedEvents);
                })
                .Where(group => group.Events.Any())
                .ToList();
        }

        /// <summary>
        /// Builds a deterministic correlation key for duplicate suppression.
        /// </summary>
        private static string BuildCorrelationKey(AlertRule rule, LargeReadWriteCandidateGroup candidateGroup)
        {
            var orderedEventIds = string.Join(",",
                candidateGroup.Events
                    .OrderBy(x => x.EventTime)
                    .ThenBy(x => x.Id)
                    .Select(x => x.Id.ToString("N")));

            var keyMaterial = string.Join("|", new[]
            {
                "large-readwrite",
                rule.Id.ToString("N"),
                rule.EventType?.ToString() ?? "Any",
                rule.GroupByField?.ToString() ?? "All",
                candidateGroup.GroupValue,
                orderedEventIds
            });

            return DataSentinelHashingHelper.ComputeSha256(keyMaterial);
        }

        /// <summary>
        /// Builds a security alert from a large read/write candidate group.
        /// </summary>
        private static SecurityAlert BuildAlert(AlertRule rule, LargeReadWriteCandidateGroup candidateGroup, DateTime evaluationTimeUtc, string correlationKey)
        {
            var triggeringEvent = candidateGroup.Events.Last();
            var totalRowsAffected = candidateGroup.Events.Sum(x => x.RowsAffected ?? 0);
            var title = $"{rule.Name} — {candidateGroup.Events.Count} large operations by {candidateGroup.GroupDescriptor}: {candidateGroup.GroupValue}";
            var summary = $"{candidateGroup.Events.Count} large {rule.EventType?.ToString() ?? "data"} operations affecting {totalRowsAffected:N0} total rows by {candidateGroup.GroupDescriptor} '{candidateGroup.GroupValue}' within {rule.WindowMinutes} minutes (threshold: {rule.ThresholdCount} rows).";
            var evidenceSummaryJson = JsonSerializer.Serialize(new
            {
                ruleId = rule.Id,
                ruleName = rule.Name,
                ruleType = rule.RuleType.ToString(),
                eventType = rule.EventType?.ToString(),
                groupBy = rule.GroupByField?.ToString(),
                groupValue = candidateGroup.GroupValue,
                observedCount = candidateGroup.Events.Count,
                thresholdCount = rule.ThresholdCount,
                windowMinutes = rule.WindowMinutes,
                totalRowsAffected,
                largeOperationDetected = true,
                earliestEventTimeUtc = candidateGroup.Events.First().EventTime,
                latestEventTimeUtc = candidateGroup.Events.Last().EventTime,
                relatedEventIds = candidateGroup.Events.Select(x => x.Id).Take(20).ToList()
            });

            return new SecurityAlert(
                triggeringEvent.TenantId,
                rule.Id,
                title,
                summary,
                rule.Severity,
                evaluationTimeUtc,
                candidateGroup.Events.First().EventTime,
                candidateGroup.Events.Last().EventTime,
                candidateGroup.Events.Count)
            {
                CorrelationKey = correlationKey,
                TriggeringActivityEventId = triggeringEvent.Id,
                ServerId = triggeringEvent.ServerId,
                DatabaseId = triggeringEvent.DatabaseId,
                PrimaryActorUser = ResolvePrimaryActorUser(candidateGroup, triggeringEvent),
                PrimaryActorIp = ResolvePrimaryActorIp(candidateGroup, triggeringEvent),
                EvidenceSummaryJson = evidenceSummaryJson
            };
        }

        /// <summary>
        /// Updates or creates the user risk profile for the alert actor.
        /// </summary>
        private async Task UpdateRiskProfileAsync(int tenantId, SecurityAlert alert, DateTime evaluationTimeUtc)
        {
            if (alert.PrimaryActorUser.IsNullOrWhiteSpace())
            {
                return;
            }

            var profile = await _userRiskProfileRepository.FindByActorAsync(tenantId, alert.PrimaryActorUser);
            var isNewProfile = profile == null;

            if (isNewProfile)
            {
                profile = new UserRiskProfile(tenantId, alert.PrimaryActorUser);
            }

            profile.ActorIp = alert.PrimaryActorIp ?? profile.ActorIp;
            profile.AlertCount += 1;

            if (alert.Severity == ActivitySeverity.High || alert.Severity == ActivitySeverity.Critical)
            {
                profile.HighSeverityAlertCount += 1;
            }

            profile.RecalculateRisk(evaluationTimeUtc);

            if (isNewProfile)
            {
                await _userRiskProfileRepository.InsertAsync(profile);
            }
        }

        private static string ResolvePrimaryActorUser(LargeReadWriteCandidateGroup candidateGroup, ActivityEvent triggeringEvent)
        {
            return candidateGroup.GroupByField == AlertRuleGroupByField.ActorUser
                ? candidateGroup.GroupValue
                : triggeringEvent.ActorUser;
        }

        private static string ResolvePrimaryActorIp(LargeReadWriteCandidateGroup candidateGroup, ActivityEvent triggeringEvent)
        {
            return candidateGroup.GroupByField == AlertRuleGroupByField.ActorIp
                ? candidateGroup.GroupValue
                : triggeringEvent.ActorIp;
        }

        /// <summary>
        /// Represents a large read/write candidate group.
        /// </summary>
        private sealed class LargeReadWriteCandidateGroup
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="LargeReadWriteCandidateGroup"/> class.
            /// </summary>
            public LargeReadWriteCandidateGroup(
                AlertRuleGroupByField? groupByField,
                string groupValue,
                List<ActivityEvent> events)
            {
                GroupByField = groupByField;
                GroupValue = groupValue;
                Events = events;
            }

            /// <summary>
            /// Gets the group-by field used to produce this group.
            /// </summary>
            public AlertRuleGroupByField? GroupByField { get; }

            /// <summary>
            /// Gets the group key value.
            /// </summary>
            public string GroupValue { get; }

            /// <summary>
            /// Gets the events included in this group.
            /// </summary>
            public List<ActivityEvent> Events { get; }

            /// <summary>
            /// Gets a human-readable descriptor for the grouping scope.
            /// </summary>
            public string GroupDescriptor => GroupByField switch
            {
                AlertRuleGroupByField.ActorUser => "actor",
                AlertRuleGroupByField.ActorIp => "source IP",
                AlertRuleGroupByField.DatabaseId => "database",
                AlertRuleGroupByField.ObjectName => "object",
                _ => "scope"
            };
        }
    }
}
