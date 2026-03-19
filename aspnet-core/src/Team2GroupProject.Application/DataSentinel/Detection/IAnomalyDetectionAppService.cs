using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Application contract for anomaly detection rule evaluation operations.
    /// </summary>
    public interface IAnomalyDetectionAppService : IApplicationService
    {
        /// <summary>
        /// Evaluates threshold rules for the active tenant.
        /// </summary>
        Task<ThresholdRuleEvaluationResultDto> EvaluateThresholdRulesAsync(EvaluateThresholdRulesInput input);

        Task<OutOfHoursRuleEvaluationResultDto> EvaluateOutOfHoursRulesAsync(EvaluateOutOfHoursRulesInput input);
        
        /// <summary>
        /// Evaluates repeated failure rules for the active tenant.
        /// </summary>
        Task<RepeatedFailureRuleEvaluationResultDto> EvaluateRepeatedFailureRulesAsync(EvaluateRepeatedFailureRulesInput input);

        /// <summary>
        /// Evaluates large read/write rules for the active tenant.
        /// </summary>
        Task<LargeReadWriteRuleEvaluationResultDto> EvaluateLargeReadWriteRulesAsync(EvaluateLargeReadWriteRulesInput input);

        /// <summary>
        /// Evaluates privileged action rules for the active tenant.
        /// </summary>
        Task<PrivilegedActionRuleEvaluationResultDto> EvaluatePrivilegedActionRulesAsync(EvaluatePrivilegedActionRulesInput input);
    }
}
