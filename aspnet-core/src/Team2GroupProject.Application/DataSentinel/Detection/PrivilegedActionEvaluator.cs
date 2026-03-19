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
    /// Evaluates privileged action rules. This evaluator is responsible for
    /// rule loading, event querying, deduplication checks, alert insertion,
    /// and risk profile updates. SaveChangesAsync is owned by the orchestrator.
    /// This is a per-event evaluator - each privileged action event produces one alert.
    /// </summary>
    public class PrivilegedActionEvaluator : IPrivilegedActionEvaluator, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;

        /// <summary>
        /// Initializes a new instance of the <see cref="PrivilegedActionEvaluator"/> class.
        /// </summary>
        public PrivilegedActionEvaluator(
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
        /// Evaluates privileged action rules for the supplied tenant.
        /// </summary>
        public Task<PrivilegedActionRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null)
        {
            var result = new PrivilegedActionRuleEvaluationResultDto
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            return EvaluateInternalAsync(tenantId, evaluationTimeUtc, ruleId, result);
        }

        /// <summary>
        /// Evaluates rules and fills the result object with persistence outcomes.
        /// </summary>
        private async Task<PrivilegedActionRuleEvaluationResultDto> EvaluateInternalAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId,
            PrivilegedActionRuleEvaluationResultDto result)
        {
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.PrivilegedAction);

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

                var catchUpStart = evaluationTimeUtc.AddHours(-24);
                var matchingEvents = await GetMatchingEventsAsync(tenantId, rule, catchUpStart, evaluationTimeUtc);

                result.CandidateGroupCount += matchingEvents.Count;

                foreach (var activityEvent in matchingEvents)
                {
                    var correlationKey = BuildCorrelationKey(rule, activityEvent);
                    var existingAlert = await _securityAlertRepository.FindByCorrelationKeyAsync(tenantId, correlationKey);
                    if (existingAlert != null)
                    {
                        result.DuplicateAlertCount++;
                        continue;
                    }

                    var alert = BuildAlert(rule, activityEvent, evaluationTimeUtc, correlationKey);
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

            return true;
        }

        /// <summary>
        /// Gets matching privileged action events for the rule.
        /// </summary>
        private async Task<List<ActivityEvent>> GetMatchingEventsAsync(
            int tenantId,
            AlertRule rule,
            DateTime windowStart,
            DateTime windowEnd)
        {
            if (rule.EventType.HasValue)
            {
                return await _activityEventRepository.GetByTimeWindowAsync(
                    tenantId,
                    windowStart,
                    windowEnd,
                    eventType: rule.EventType.Value);
            }

            var privilegedEvents = await _activityEventRepository.GetByTimeWindowAsync(
                tenantId,
                windowStart,
                windowEnd,
                eventType: ActivityEventType.PrivilegedAction);

            var permissionEvents = await _activityEventRepository.GetByTimeWindowAsync(
                tenantId,
                windowStart,
                windowEnd,
                eventType: ActivityEventType.PermissionChange);

            return privilegedEvents.Concat(permissionEvents)
                .OrderBy(x => x.EventTime)
                .ThenBy(x => x.Id)
                .ToList();
        }

        /// <summary>
        /// Builds a deterministic correlation key for duplicate suppression.
        /// </summary>
        private static string BuildCorrelationKey(AlertRule rule, ActivityEvent activityEvent)
        {
            var keyMaterial = string.Join("|", new[]
            {
                "privileged-action",
                rule.Id.ToString("N"),
                activityEvent.Id.ToString("N")
            });

            return DataSentinelHashingHelper.ComputeSha256(keyMaterial);
        }

        /// <summary>
        /// Builds a security alert from a privileged action event.
        /// </summary>
        private static SecurityAlert BuildAlert(
            AlertRule rule,
            ActivityEvent activityEvent,
            DateTime evaluationTimeUtc,
            string correlationKey)
        {
            var title = $"{rule.Name} — privileged action recorded";
            var summary = $"{activityEvent.ActorUser ?? "unknown"} performed {activityEvent.EventType} at {activityEvent.EventTime:yyyy-MM-dd HH:mm} UTC";
            var evidenceSummaryJson = JsonSerializer.Serialize(new
            {
                ruleId = rule.Id,
                ruleName = rule.Name,
                ruleType = rule.RuleType.ToString(),
                eventType = activityEvent.EventType.ToString(),
                actorUser = activityEvent.ActorUser,
                actorIp = activityEvent.ActorIp,
                eventTime = activityEvent.EventTime,
                privilegedActionDetected = true,
                serverId = activityEvent.ServerId,
                databaseId = activityEvent.DatabaseId,
                objectName = activityEvent.ObjectName,
                operation = activityEvent.Operation,
                rowsAffected = activityEvent.RowsAffected
            });

            return new SecurityAlert(
                activityEvent.TenantId,
                rule.Id,
                title,
                summary,
                rule.Severity,
                evaluationTimeUtc,
                activityEvent.EventTime,
                activityEvent.EventTime,
                1)
            {
                CorrelationKey = correlationKey,
                TriggeringActivityEventId = activityEvent.Id,
                ServerId = activityEvent.ServerId,
                DatabaseId = activityEvent.DatabaseId,
                PrimaryActorUser = activityEvent.ActorUser,
                PrimaryActorIp = activityEvent.ActorIp,
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
    }
}
