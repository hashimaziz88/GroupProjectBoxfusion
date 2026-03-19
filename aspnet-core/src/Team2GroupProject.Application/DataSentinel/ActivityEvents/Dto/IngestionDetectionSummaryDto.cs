using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class IngestionDetectionSummaryDto
    {
        public int EvaluatedAnchorCount { get; set; }

        public int CreatedAlertCount { get; set; }

        public int DuplicateAlertCount { get; set; }

        public List<Guid> CreatedAlertIds { get; set; } = new List<Guid>();
    }
}
