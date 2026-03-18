using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Detection.Dto
{
    public class ThresholdRuleEvaluationResultDto
    {
        public DateTime EvaluationTimeUtc { get; set; }

        public int EvaluatedRuleCount { get; set; }

        public int SkippedRuleCount { get; set; }

        public int CandidateGroupCount { get; set; }

        public int CreatedAlertCount { get; set; }

        public int DuplicateAlertCount { get; set; }

        public List<Guid> CreatedAlertIds { get; set; } = new List<Guid>();
    }
}
