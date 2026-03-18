using System;
using System.Threading.Tasks;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    public interface IThresholdRuleEvaluator
    {
        Task<ThresholdRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            ActivityEventType? eventType = null,
            Guid? ruleId = null);
    }
}
