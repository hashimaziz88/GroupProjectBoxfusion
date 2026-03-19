using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Detection.Dto
{
    /// <summary>
    /// Describes the outcome of a repeated failure rule evaluation pass.
    /// </summary>
    public class RepeatedFailureRuleEvaluationResultDto
    {
        /// <summary>
        /// The UTC timestamp used as the upper bound for evaluation windows.
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
        /// Number of alerts created.
        /// </summary>
        public int CreatedAlertCount { get; set; }

        /// <summary>
        /// Number of duplicate candidates suppressed.
        /// </summary>
        public int DuplicateAlertCount { get; set; }

        /// <summary>
        /// IDs of created alerts.
        /// </summary>
        public List<Guid> CreatedAlertIds { get; set; } = new List<Guid>();
    }
}
