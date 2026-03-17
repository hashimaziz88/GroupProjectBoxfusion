using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventIngestionResultDto
    {
        public int ReceivedCount { get; set; }

        public int AcceptedCount { get; set; }

        public int RejectedCount { get; set; }

        public List<Guid> CreatedEventIds { get; set; } = new List<Guid>();

        public List<ActivityEventIngestionErrorDto> Errors { get; set; } = new List<ActivityEventIngestionErrorDto>();
    }
}
