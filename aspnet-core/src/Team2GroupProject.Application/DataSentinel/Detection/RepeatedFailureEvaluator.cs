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
    /// Evaluates repeated failure rules. This evaluator is responsible for
    /// rule loading, event querying, deduplication checks, alert insertion,
    /// and risk profile updates. SaveChangesAsync is owned by the orchestrator.
    /// </summary>
    public class RepeatedFailureEvaluator : IRepeatedFailureEvaluator, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="RepeatedFailureEvaluator"/> class.
        /// </summary>
        public RepeatedFailureEvaluator(
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
        /// Evaluates repeated failure rules for the supplied tenant.
        /// </summary>
        public Task<RepeatedFailureRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null)
        {
            var result = new RepeatedFailureRuleEvaluationResultDto
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            return EvaluateInternalAsync(tenantId, evaluationTimeUtc, ruleId, result);
        }

        /// <summary>
        /// Evaluates rules and fills the result object with persistence outcomes.
        /// </summary>
        private async Task<RepeatedFailureRuleEvaluationResultDto> EvaluateInternalAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId,
            RepeatedFailureRuleEvaluationResultDto result)
        {
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.RepeatedFailure);

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
                    isSuccess: false);

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

            return rule.GroupByField == AlertRuleGroupByField.ActorUser
                || rule.GroupByField == AlertRuleGroupByField.ActorIp;
        }

        /// <summary>
        /// Builds threshold-qualified candidate groups from matching events.
        /// </summary>
        private static List<RepeatedFailureCandidateGroup> BuildCandidateGroups(AlertRule rule, IReadOnlyList<ActivityEvent> events)
        {
            IEnumerable<IGrouping<string, ActivityEvent>> groupedEvents;

            if (rule.GroupByField == AlertRuleGroupByField.ActorIp)
            {
                groupedEvents = events.GroupBy(x => x.ActorIp ?? "unknown");
            }
            else
            {
                groupedEvents = events.GroupBy(x => x.ActorUser ?? "unknown");
            }

            return groupedEvents
                .Select(group =>
                {
                    var orderedEvents = group
                        .OrderBy(x => x.EventTime)
                        .ThenBy(x => x.Id)
                        .ToList();

                    return new RepeatedFailureCandidateGroup(rule.GroupByField, group.Key, orderedEvents);
                })
                .Where(group => group.Events.Count >= rule.ThresholdCount)
                .ToList();
        }

        /// <summary>
        /// Builds a deterministic correlation key for duplicate suppression.
        /// </summary>
        private static string BuildCorrelationKey(AlertRule rule, RepeatedFailureCandidateGroup candidateGroup)
        {
            var orderedEventIds = string.Join(",",
                candidateGroup.Events
                    .OrderBy(x => x.EventTime)
                    .ThenBy(x => x.Id)
                    .Select(x => x.Id.ToString("N")));

            var keyMaterial = string.Join("|", new[]
            {
                "repeated-failure",
                rule.Id.ToString("N"),
                rule.EventType?.ToString() ?? "Any",
                rule.GroupByField?.ToString() ?? "All",
                candidateGroup.GroupValue,
                orderedEventIds
            });

            return DataSentinelHashingHelper.ComputeSha256(keyMaterial);
        }

        /// <summary>
        /// Builds a security alert from a repeated failure candidate group.
        /// </summary>
        private static SecurityAlert BuildAlert(AlertRule rule, RepeatedFailureCandidateGroup candidateGroup, DateTime evaluationTimeUtc, string correlationKey)
        {
            var triggeringEvent = candidateGroup.Events.Last();
            var title = $"{rule.Name} — {candidateGroup.Events.Count} failures by {candidateGroup.GroupDescriptor}: {candidateGroup.GroupValue}";
            var summary = $"{candidateGroup.Events.Count} failed {rule.EventType?.ToString() ?? "operation"} attempts by {candidateGroup.GroupDescriptor} '{candidateGroup.GroupValue}' within {rule.WindowMinutes} minutes (threshold: {rule.ThresholdCount}).";
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
                allEventsFailed = true,
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
                PrimaryActorUser = candidateGroup.GroupByField == AlertRuleGroupByField.ActorUser
                    ? candidateGroup.GroupValue
                    : triggeringEvent.ActorUser,
                PrimaryActorIp = candidateGroup.GroupByField == AlertRuleGroupByField.ActorIp
                    ? candidateGroup.GroupValue
                    : triggeringEvent.ActorIp,
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

        /// <summary>
        /// Represents a repeated-failure candidate group.
        /// </summary>
        private sealed class RepeatedFailureCandidateGroup
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="RepeatedFailureCandidateGroup"/> class.
            /// </summary>
            public RepeatedFailureCandidateGroup(
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
                AlertRuleGroupByField.ActorIp => "source IP",
                _ => "actor"
            };
        }
    }
}
