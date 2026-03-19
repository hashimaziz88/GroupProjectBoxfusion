using System;
using System.Threading.Tasks;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    public interface IOutOfHoursRuleEvaluator
    {
        Task<OutOfHoursRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null);
    }
}
