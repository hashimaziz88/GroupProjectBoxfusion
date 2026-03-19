using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    /// <summary>
    /// Summary returned after a batch activity import attempt.
    /// </summary>
    public class ActivityEventIngestionResultDto
    {
        /// <summary>
        /// Total number of records received in the batch.
        /// </summary>
        public int ReceivedCount { get; set; }

        /// <summary>
        /// Number of records successfully persisted.
        /// </summary>
        public int AcceptedCount { get; set; }

        /// <summary>
        /// Number of records rejected during validation or mapping.
        /// </summary>
        public int RejectedCount { get; set; }

        /// <summary>
        /// Identifiers generated for successfully imported activity events.
        /// </summary>
        public List<Guid> CreatedEventIds { get; set; } = new List<Guid>();

        /// <summary>
        /// Indexed validation or mapping failures for rejected items.
        /// </summary>
        public List<ActivityEventIngestionErrorDto> Errors { get; set; } = new List<ActivityEventIngestionErrorDto>();

        /// <summary>
        /// Summary of any ingestion-triggered rule evaluation performed for accepted events.
        /// </summary>
        public IngestionDetectionSummaryDto DetectionSummary { get; set; } = new IngestionDetectionSummaryDto();
    }
}
