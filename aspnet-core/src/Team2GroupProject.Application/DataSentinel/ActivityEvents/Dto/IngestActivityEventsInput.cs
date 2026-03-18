using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    /// <summary>
    /// Structured batch import payload for DataSentinel activity events.
    /// </summary>
    public class IngestActivityEventsInput
    {
        /// <summary>
        /// Ordered list of activity records to validate and import.
        /// Item indexes are preserved in the import result for partial-failure reporting.
        /// </summary>
        [Required]
        [MinLength(1)]
        public List<ActivityEventIngestionItemDto> Events { get; set; } = new List<ActivityEventIngestionItemDto>();
    }
}
