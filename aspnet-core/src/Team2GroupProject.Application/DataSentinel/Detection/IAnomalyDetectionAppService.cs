using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    public interface IAnomalyDetectionAppService : IApplicationService
    {
        Task<ThresholdRuleEvaluationResultDto> EvaluateThresholdRulesAsync(EvaluateThresholdRulesInput input);

        Task<OutOfHoursRuleEvaluationResultDto> EvaluateOutOfHoursRulesAsync(EvaluateOutOfHoursRulesInput input);
    }
}
