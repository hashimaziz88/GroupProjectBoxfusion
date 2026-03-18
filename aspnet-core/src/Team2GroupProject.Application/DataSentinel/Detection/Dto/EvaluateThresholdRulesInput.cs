using System;

namespace Team2GroupProject.DataSentinel.Detection.Dto
{
    public class EvaluateThresholdRulesInput
    {
        /// <summary>
        /// Optional evaluation timestamp. Defaults to the current UTC time when omitted.
        /// </summary>
        public DateTime? EvaluationTimeUtc { get; set; }

        /// <summary>
        /// Optional rule filter for targeted evaluation during testing or incident triage.
        /// </summary>
        public Guid? RuleId { get; set; }
    }
}
