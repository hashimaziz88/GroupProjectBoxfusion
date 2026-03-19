using System;

namespace Team2GroupProject.DataSentinel.Detection.Dto
{
    /// <summary>
    /// Input parameters for a privileged action rule evaluation pass.
    /// </summary>
    public class EvaluatePrivilegedActionRulesInput
    {
        /// <summary>
        /// Optional evaluation timestamp in UTC.
        /// </summary>
        public DateTime? EvaluationTimeUtc { get; set; }

        /// <summary>
        /// Optional rule ID filter.
        /// </summary>
        public Guid? RuleId { get; set; }
    }
}
