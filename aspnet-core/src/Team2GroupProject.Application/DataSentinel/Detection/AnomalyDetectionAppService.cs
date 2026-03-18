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
        private readonly IThresholdRuleEvaluator _thresholdRuleEvaluator;
        private readonly IOutOfHoursRuleEvaluator _outOfHoursRuleEvaluator;
        private readonly IRepeatedFailureEvaluator _repeatedFailureEvaluator;
        
        public AnomalyDetectionAppService(
            IThresholdRuleEvaluator thresholdRuleEvaluator,
            IOutOfHoursRuleEvaluator outOfHoursRuleEvaluator,
            IRepeatedFailureEvaluator repeatedFailureEvaluator)
        {
            _thresholdRuleEvaluator = thresholdRuleEvaluator;
            _outOfHoursRuleEvaluator = outOfHoursRuleEvaluator;
            _repeatedFailureEvaluator = repeatedFailureEvaluator;
               

        public async Task<ThresholdRuleEvaluationResultDto> EvaluateThresholdRulesAsync(EvaluateThresholdRulesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTimeUtc = NormalizeEvaluationTime(input?.EvaluationTimeUtc ?? Clock.Now);
            var result = await _thresholdRuleEvaluator.EvaluateAsync(tenantId, evaluationTimeUtc, ruleId: input?.RuleId);

            if (result.CreatedAlertIds.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return result;
        }

        public async Task<OutOfHoursRuleEvaluationResultDto> EvaluateOutOfHoursRulesAsync(EvaluateOutOfHoursRulesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTimeUtc = NormalizeEvaluationTime(input?.EvaluationTimeUtc ?? Clock.Now);
            var result = await _outOfHoursRuleEvaluator.EvaluateAsync(tenantId, evaluationTimeUtc, ruleId: input?.RuleId);

            if (result.CreatedAlertIds.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return result;
        }

        private static DateTime NormalizeEvaluationTime(DateTime value)
        {
            if (value.Kind == DateTimeKind.Unspecified)
            {
                return DateTime.SpecifyKind(value, DateTimeKind.Utc);
            }

            return value.ToUniversalTime();
        }

        /// <summary>
        /// Evaluates repeated failure rules for the active tenant.
        /// </summary>
        public async Task<RepeatedFailureRuleEvaluationResultDto> EvaluateRepeatedFailureRulesAsync(
            EvaluateRepeatedFailureRulesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTimeUtc = NormalizeEvaluationTime(input?.EvaluationTimeUtc ?? Clock.Now);
            var result = await _repeatedFailureEvaluator.EvaluateAsync(tenantId, evaluationTimeUtc, ruleId: input?.RuleId);
            if (result.CreatedAlertIds.Count > 0) { await CurrentUnitOfWork.SaveChangesAsync(); }
            return result;
        }
    }
}
