using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.UI;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.Detection
{
    public class OutOfHoursRuleEvaluator : IOutOfHoursRuleEvaluator, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IActivityEventRepository _activityEventRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public OutOfHoursRuleEvaluator(
            IAlertRuleRepository alertRuleRepository,
            IActivityEventRepository activityEventRepository,
            ISecurityAlertRepository securityAlertRepository,
            IUserRiskProfileRepository userRiskProfileRepository,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _alertRuleRepository = alertRuleRepository;
            _activityEventRepository = activityEventRepository;
            _securityAlertRepository = securityAlertRepository;
            _userRiskProfileRepository = userRiskProfileRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task<OutOfHoursRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null)
        {
            var rules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.OutOfHours);

            if (ruleId.HasValue)
            {
                rules = rules.Where(x => x.Id == ruleId.Value).ToList();
            }

            var result = new OutOfHoursRuleEvaluationResultDto
            {
                EvaluationTimeUtc = evaluationTimeUtc
            };

            var candidateEvents = await LoadCandidateEventsAsync(tenantId, evaluationTimeUtc);

            foreach (var rule in rules.OrderBy(x => x.Name))
            {
                if (!CanEvaluateOutOfHoursRule(rule))
                {
                    result.SkippedRuleCount++;
                    continue;
                }

                result.EvaluatedRuleCount++;
                result.CandidateGroupCount += candidateEvents.Count;

                foreach (var candidateEvent in candidateEvents)
                {
                    var correlationKey = BuildCorrelationKey(rule, candidateEvent);
                    var existingAlert = await _securityAlertRepository.FindByCorrelationKeyAsync(tenantId, correlationKey);
                    if (existingAlert != null)
                    {
                        result.DuplicateAlertCount++;
                        continue;
                    }

                    var alert = BuildAlert(rule, candidateEvent, evaluationTimeUtc, correlationKey);
                    await _securityAlertRepository.InsertAsync(alert);
                    await UpdateRiskProfileAsync(tenantId, alert, evaluationTimeUtc);

                    result.CreatedAlertIds.Add(alert.Id);
                }
            }

            result.CreatedAlertCount = result.CreatedAlertIds.Count;

            if (result.CreatedAlertIds.Count > 0)
            {
                await _unitOfWorkManager.Current.SaveChangesAsync();
            }

            return result;
        }

        private async Task<List<ActivityEvent>> LoadCandidateEventsAsync(int tenantId, DateTime evaluationTimeUtc)
        {
            var matchingEvents = await _activityEventRepository.GetByTimeWindowAsync(
                tenantId,
                evaluationTimeUtc,
                evaluationTimeUtc,
                isOutOfHours: true);

            return matchingEvents
                .Where(IsRiskyOutOfHoursEvent)
                .OrderBy(x => x.EventTime)
                .ThenBy(x => x.Id)
                .ToList();
        }

        private static bool CanEvaluateOutOfHoursRule(AlertRule rule)
        {
            try
            {
                rule.EnsureConfigurationIsValid();
            }
            catch (UserFriendlyException)
            {
                return false;
            }

            return rule.RuleType == AlertRuleType.OutOfHours;
        }

        private static bool IsRiskyOutOfHoursEvent(ActivityEvent activityEvent)
        {
            return activityEvent.EventType == ActivityEventType.Write ||
                   activityEvent.EventType == ActivityEventType.PrivilegedAction;
        }

        private static string BuildCorrelationKey(AlertRule rule, ActivityEvent activityEvent)
        {
            var keyMaterial = string.Join("|", new[]
            {
                "out-of-hours",
                rule.Id.ToString("N"),
                activityEvent.Id.ToString("N")
            });

            return DataSentinelHashingHelper.ComputeSha256(keyMaterial);
        }

        private static SecurityAlert BuildAlert(
            AlertRule rule,
            ActivityEvent activityEvent,
            DateTime evaluationTimeUtc,
            string correlationKey)
        {
            var title = BuildAlertTitle(rule, activityEvent);
            var summary = BuildAlertSummary(rule, activityEvent);
            var evidenceSummaryJson = JsonSerializer.Serialize(new
            {
                ruleId = rule.Id,
                ruleName = rule.Name,
                ruleType = rule.RuleType.ToString(),
                eventId = activityEvent.Id,
                eventType = activityEvent.EventType.ToString(),
                eventTimeUtc = activityEvent.EventTime,
                isOutOfHours = activityEvent.IsOutOfHours,
                actorUser = activityEvent.ActorUser,
                actorIp = activityEvent.ActorIp,
                operation = activityEvent.Operation,
                objectName = activityEvent.ObjectName,
                databaseId = activityEvent.DatabaseId,
                serverId = activityEvent.ServerId
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
                relatedEventCount: 1)
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
            profile.OutOfHoursEventCount += 1;

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

        private static string BuildAlertTitle(AlertRule rule, ActivityEvent activityEvent)
        {
            if (!activityEvent.ActorUser.IsNullOrWhiteSpace())
            {
                return $"{rule.Name} detected for actor: {activityEvent.ActorUser}";
            }

            return $"{rule.Name} detected";
        }

        private static string BuildAlertSummary(AlertRule rule, ActivityEvent activityEvent)
        {
            var operationText = activityEvent.Operation.IsNullOrWhiteSpace()
                ? activityEvent.EventType.ToString()
                : activityEvent.Operation;
            var objectText = activityEvent.ObjectName.IsNullOrWhiteSpace()
                ? string.Empty
                : $" against '{activityEvent.ObjectName}'";
            var actorText = activityEvent.ActorUser.IsNullOrWhiteSpace()
                ? "an unknown actor"
                : $"actor '{activityEvent.ActorUser}'";

            return $"Out-of-hours {operationText} activity{objectText} matched rule '{rule.Name}' for {actorText} at {activityEvent.EventTime:u}.";
        }
    }
}
