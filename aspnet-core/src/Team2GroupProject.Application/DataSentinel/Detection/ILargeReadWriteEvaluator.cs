using System;
using System.Threading.Tasks;
using Team2GroupProject.DataSentinel.Detection.Dto;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Defines large read/write rule evaluation behavior.
    /// The evaluator owns rule loading, event querying, deduplication,
    /// alert insertion, and risk profile updates.
    /// The orchestrator owns SaveChangesAsync only.
    /// </summary>
    public interface ILargeReadWriteEvaluator
    {
        /// <summary>
        /// Evaluates large read/write rules for the supplied tenant.
        /// </summary>
        /// <param name="tenantId">Tenant identifier.</param>
        /// <param name="evaluationTimeUtc">Evaluation upper-bound timestamp in UTC.</param>
        /// <param name="ruleId">Optional single-rule filter.</param>
        /// <returns>Large read/write evaluation result DTO.</returns>
        Task<LargeReadWriteRuleEvaluationResultDto> EvaluateAsync(
            int tenantId,
            DateTime evaluationTimeUtc,
            Guid? ruleId = null);
    }
}
