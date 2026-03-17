using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventIngestionItemDto
    {
        public Guid? ServerId { get; set; }

        public Guid? DatabaseId { get; set; }

        public DateTime? EventTime { get; set; }

        public ActivityEventType? EventType { get; set; }

        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        public string ObjectName { get; set; }

        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int? DurationMs { get; set; }

        public bool? IsOutOfHours { get; set; }

        public ActivitySeverity? Severity { get; set; }

        public bool? IsSuccess { get; set; }

        public string FailureReason { get; set; }

        public Dictionary<string, string> Evidence { get; set; }
    }
}
