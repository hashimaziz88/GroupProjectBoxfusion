using System;
using System.Threading.Tasks;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Defines repeated failure rule evaluation behavior.
    /// The evaluator owns rule loading, event querying, deduplication,
    /// alert insertion, and risk profile updates.
    /// The orchestrator owns SaveChangesAsync only.
    /// </summary>
    public interface IRepeatedFailureEvaluator
    {
        /// <summary>
        /// Evaluates repeated failure rules for the supplied tenant.
        /// </summary>
        /// <param name="tenantId">Tenant identifier.</param>
        /// <param name="evaluationTimeUtc">Evaluation upper-bound timestamp in UTC.</param>
        /// <param name="ruleId">Optional single-rule filter.</param>
        /// <returns>Repeated failure evaluation result DTO.</returns>
        Task<RepeatedFailureRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null);
    }
}
