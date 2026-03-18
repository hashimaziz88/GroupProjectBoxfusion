using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Timing;
using Abp.UI;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Provides repeated failure evaluation logic for anomaly detection orchestration.
    /// </summary>
    public class RepeatedFailureEvaluator : IRepeatedFailureEvaluator, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="RepeatedFailureEvaluator"/> class.
        /// </summary>
        /// <param name="alertRuleRepository">Alert rule repository.</param>
        /// <param name="activityEventRepository">Activity event repository.</param>
        public RepeatedFailureEvaluator(
            IAlertRuleRepository alertRuleRepository,
            IActivityEventRepository activityEventRepository)
        {
            _alertRuleRepository = alertRuleRepository;
            _activityEventRepository = activityEventRepository;
        }

        /// <summary>
        /// Evaluates repeated failure rules for a tenant.
        /// </summary>
        /// <param name="tenantId">Tenant ID.</param>
        /// <param name="input">Evaluation input.</param>
        /// <returns>Evaluation output container.</returns>
        public async Task<RepeatedFailureEvaluationOutput> EvaluateAsync(int tenantId, EvaluateRepeatedFailureRulesInput input)
        {
            var evaluationTimeUtc = NormalizeEvaluationTime(input?.EvaluationTimeUtc ?? Clock.Now);
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.RepeatedFailure);

            if (input?.RuleId.HasValue == true)
            {
                rules = rules.Where(x => x.Id == input.RuleId.Value).ToList();
            }

            var output = new RepeatedFailureEvaluationOutput
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            foreach (var rule in rules.OrderBy(x => x.Name))
            {
                if (!CanEvaluate(rule))
                {
                    output.SkippedRuleCount++;
                    continue;
                }

                output.EvaluatedRuleCount++;

                var windowStart = evaluationTimeUtc.AddMinutes(-rule.WindowMinutes);
                var matchingEvents = await _activityEventRepository.GetByTimeWindowAsync(
                    tenantId,
                    windowStart,
                    evaluationTimeUtc,
                    eventType: rule.EventType,
                    isSuccess: false);

                var candidateGroups = BuildCandidateGroups(rule, matchingEvents);
                output.CandidateGroupCount += candidateGroups.Count;

                foreach (var candidateGroup in candidateGroups)
                {
                    var correlationKey = BuildCorrelationKey(rule, candidateGroup);
                    var alert = BuildAlert(rule, candidateGroup, evaluationTimeUtc, correlationKey);

                    output.AlertCandidates.Add(new RepeatedFailureAlertCandidate
                    {
                        Rule = rule,
                        Alert = alert
                    });
                }
            }

            return output;
        }

        /// <summary>
        /// Determines whether a rule can be evaluated by this evaluator.
        /// </summary>
        /// <param name="rule">Rule to inspect.</param>
        /// <returns><c>true</c> when the rule has a valid actor-scoped configuration; otherwise <c>false</c>.</returns>
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

            return rule.GroupByField == AlertRuleGroupByField.ActorUser ||
                   rule.GroupByField == AlertRuleGroupByField.ActorIp;
        }

        /// <summary>
        /// Builds candidate groups from matching events.
        /// </summary>
        /// <param name="rule">Rule context.</param>
        /// <param name="events">Matching events.</param>
        /// <returns>Candidate groups that meet the configured threshold.</returns>
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
        /// Builds a deterministic correlation key for candidate deduplication.
        /// </summary>
        /// <param name="rule">Rule context.</param>
        /// <param name="candidateGroup">Candidate group context.</param>
        /// <returns>Deterministic SHA-256 correlation key.</returns>
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
        /// Builds a <see cref="SecurityAlert"/> for a repeated failure candidate group.
        /// </summary>
        /// <param name="rule">Rule context.</param>
        /// <param name="candidateGroup">Candidate group context.</param>
        /// <param name="evaluationTimeUtc">Evaluation time in UTC.</param>
        /// <param name="correlationKey">Deterministic correlation key.</param>
        /// <returns>A built security alert.</returns>
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
                earliestEventTimeUtc = candidateGroup.Events.First().EventTime,
                latestEventTimeUtc = candidateGroup.Events.Last().EventTime,
                allEventsFailed = true,
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
        /// Normalizes an evaluation timestamp to UTC.
        /// </summary>
        /// <param name="value">Input timestamp.</param>
        /// <returns>UTC-normalized timestamp.</returns>
        private static DateTime NormalizeEvaluationTime(DateTime value)
        {
            if (value.Kind == DateTimeKind.Unspecified)
            {
                return DateTime.SpecifyKind(value, DateTimeKind.Utc);
            }

            return value.ToUniversalTime();
        }

        /// <summary>
        /// Represents one actor-scoped repeated failure candidate group.
        /// </summary>
        private sealed class RepeatedFailureCandidateGroup
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="RepeatedFailureCandidateGroup"/> class.
            /// </summary>
            /// <param name="groupByField">Grouping field used by the rule.</param>
            /// <param name="groupValue">Group key value.</param>
            /// <param name="events">Ordered events in the group.</param>
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
            /// Gets the rule grouping field.
            /// </summary>
            public AlertRuleGroupByField? GroupByField { get; }

            /// <summary>
            /// Gets the group key value.
            /// </summary>
            public string GroupValue { get; }

            /// <summary>
            /// Gets the ordered events in this group.
            /// </summary>
            public List<ActivityEvent> Events { get; }

            /// <summary>
            /// Gets a display descriptor for the group scope.
            /// </summary>
            public string GroupDescriptor => GroupByField == AlertRuleGroupByField.ActorIp ? "source IP" : "actor";
        }
    }
}
