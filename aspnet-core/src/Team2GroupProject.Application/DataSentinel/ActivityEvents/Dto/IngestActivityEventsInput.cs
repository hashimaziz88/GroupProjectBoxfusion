using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class IngestActivityEventsInput
    {
        [Required]
        [MinLength(1)]
        public List<ActivityEventIngestionItemDto> Events { get; set; } = new List<ActivityEventIngestionItemDto>();
    }
}
