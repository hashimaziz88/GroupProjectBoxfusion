using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.DataSentinel.Detection
{
    /// <summary>
    /// Defines repeated failure rule evaluation behavior.
    /// The evaluator does not persist alerts, does not update risk profiles,
    /// and does not call SaveChangesAsync.
    /// </summary>
    public interface IRepeatedFailureEvaluator
    {
        /// <summary>
        /// Evaluates repeated failure rules for the supplied tenant.
        /// </summary>
        /// <param name="tenantId">Tenant ID.</param>
        /// <param name="input">Evaluation input parameters.</param>
        /// <returns>Evaluation output containing built alert candidates.</returns>
        Task<RepeatedFailureEvaluationOutput> EvaluateAsync(int tenantId, EvaluateRepeatedFailureRulesInput input);
    }

    /// <summary>
    /// Represents repeated failure evaluation output.
    /// </summary>
    public class RepeatedFailureEvaluationOutput
    {
        /// <summary>
        /// Evaluation timestamp in UTC.
        /// </summary>
        public DateTime EvaluationTimeUtc { get; set; }

        /// <summary>
        /// Number of rules evaluated.
        /// </summary>
        public int EvaluatedRuleCount { get; set; }

        /// <summary>
        /// Number of rules skipped.
        /// </summary>
        public int SkippedRuleCount { get; set; }

        /// <summary>
        /// Number of candidate groups produced.
        /// </summary>
        public int CandidateGroupCount { get; set; }

        /// <summary>
        /// Built alert candidates.
        /// </summary>
        public List<RepeatedFailureAlertCandidate> AlertCandidates { get; set; } = new List<RepeatedFailureAlertCandidate>();
    }

    /// <summary>
    /// Represents a repeated failure alert candidate with rule context.
    /// </summary>
    public class RepeatedFailureAlertCandidate
    {
        /// <summary>
        /// Rule that produced the candidate.
        /// </summary>
        public AlertRule Rule { get; set; }

        /// <summary>
        /// Alert built for persistence by the orchestrator.
        /// </summary>
        public SecurityAlert Alert { get; set; }
    }
}
