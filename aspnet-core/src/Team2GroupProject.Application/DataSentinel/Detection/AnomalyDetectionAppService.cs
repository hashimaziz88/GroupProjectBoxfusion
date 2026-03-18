using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.Timing;
using Abp.UI;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.Detection
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Admin)]
    public class AnomalyDetectionAppService : Team2GroupProjectAppServiceBase, IAnomalyDetectionAppService
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;

        public AnomalyDetectionAppService(
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

        public async Task<ThresholdRuleEvaluationResultDto> EvaluateThresholdRulesAsync(EvaluateThresholdRulesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTimeUtc = NormalizeEvaluationTime(input?.EvaluationTimeUtc ?? Clock.Now);
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.ThresholdBased);

            if (input?.RuleId.HasValue == true)
            {
                rules = rules.Where(x => x.Id == input.RuleId.Value).ToList();
            }

            var result = new ThresholdRuleEvaluationResultDto
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            foreach (var rule in rules.OrderBy(x => x.Name))
            {
                if (!CanEvaluateThresholdRule(rule))
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
                    eventType: rule.EventType);

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

                    var alert = BuildThresholdAlert(rule, candidateGroup, evaluationTimeUtc, correlationKey);
                    await _securityAlertRepository.InsertAsync(alert);
                    await UpdateRiskProfileAsync(tenantId, alert, evaluationTimeUtc);

                    result.CreatedAlertIds.Add(alert.Id);
                }
            }

            if (result.CreatedAlertIds.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            result.CreatedAlertCount = result.CreatedAlertIds.Count;
            return result;
        }

        private static bool CanEvaluateThresholdRule(AlertRule rule)
        {
            try
            {
                rule.EnsureConfigurationIsValid();
            }
            catch (UserFriendlyException)
            {
                return false;
            }

            return rule.EventType.HasValue;
        }

        private static List<ThresholdRuleCandidateGroup> BuildCandidateGroups(AlertRule rule, IReadOnlyList<ActivityEvent> events)
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

                    return new ThresholdRuleCandidateGroup(rule.GroupByField, group.Key, orderedEvents);
                })
                .Where(group => group.Events.Count >= rule.ThresholdCount)
                .ToList();
        }

        private static string BuildCorrelationKey(AlertRule rule, ThresholdRuleCandidateGroup candidateGroup)
        {
            var orderedEventIds = string.Join(",",
                candidateGroup.Events
                    .OrderBy(x => x.EventTime)
                    .ThenBy(x => x.Id)
                    .Select(x => x.Id.ToString("N")));

            var keyMaterial = string.Join("|", new[]
            {
                "threshold",
                rule.Id.ToString("N"),
                rule.EventType?.ToString() ?? "Any",
                rule.GroupByField?.ToString() ?? "All",
                candidateGroup.GroupValue,
                orderedEventIds
            });

            return DataSentinelHashingHelper.ComputeSha256(keyMaterial);
        }

        private static SecurityAlert BuildThresholdAlert(
            AlertRule rule,
            ThresholdRuleCandidateGroup candidateGroup,
            DateTime evaluationTimeUtc,
            string correlationKey)
        {
            var triggeringEvent = candidateGroup.Events.Last();
            var title = BuildAlertTitle(rule, candidateGroup);
            var summary = BuildAlertSummary(rule, candidateGroup);
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

        private static DateTime NormalizeEvaluationTime(DateTime value)
        {
            if (value.Kind == DateTimeKind.Unspecified)
            {
                return DateTime.SpecifyKind(value, DateTimeKind.Utc);
            }

            return value.ToUniversalTime();
        }

        private static string BuildAlertTitle(AlertRule rule, ThresholdRuleCandidateGroup candidateGroup)
        {
            if (rule.GroupByField.HasValue && candidateGroup.GroupValue != "ALL")
            {
                return $"{rule.Name} exceeded for {candidateGroup.GroupDescriptor}: {candidateGroup.GroupValue}";
            }

            return $"{rule.Name} exceeded";
        }

        private static string BuildAlertSummary(AlertRule rule, ThresholdRuleCandidateGroup candidateGroup)
        {
            var count = candidateGroup.Events.Count;
            var eventTypeLabel = rule.EventType?.ToString() ?? "activity";

            if (rule.GroupByField.HasValue && candidateGroup.GroupValue != "ALL")
            {
                return $"{count} {eventTypeLabel} events matched rule '{rule.Name}' for {candidateGroup.GroupDescriptor} '{candidateGroup.GroupValue}' within {rule.WindowMinutes} minutes (threshold: {rule.ThresholdCount}).";
            }

            return $"{count} {eventTypeLabel} events matched rule '{rule.Name}' within {rule.WindowMinutes} minutes (threshold: {rule.ThresholdCount}).";
        }

        private static string ResolvePrimaryActorUser(ThresholdRuleCandidateGroup candidateGroup, ActivityEvent triggeringEvent)
        {
            return candidateGroup.GroupByField == AlertRuleGroupByField.ActorUser
                ? candidateGroup.GroupValue
                : triggeringEvent.ActorUser;
        }

        private static string ResolvePrimaryActorIp(ThresholdRuleCandidateGroup candidateGroup, ActivityEvent triggeringEvent)
        {
            return candidateGroup.GroupByField == AlertRuleGroupByField.ActorIp
                ? candidateGroup.GroupValue
                : triggeringEvent.ActorIp;
        }

        private sealed class ThresholdRuleCandidateGroup
        {
            public ThresholdRuleCandidateGroup(
                AlertRuleGroupByField? groupByField,
                string groupValue,
                List<ActivityEvent> events)
            {
                GroupByField = groupByField;
                GroupValue = groupValue;
                Events = events;
            }

            public AlertRuleGroupByField? GroupByField { get; }

            public string GroupValue { get; }

            public List<ActivityEvent> Events { get; }

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
