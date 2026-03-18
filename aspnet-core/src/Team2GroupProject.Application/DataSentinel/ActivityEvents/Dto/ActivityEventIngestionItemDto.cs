using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    /// <summary>
    /// Represents one normalized activity event in a batch import payload.
    /// </summary>
    public class ActivityEventIngestionItemDto
    {
        /// <summary>
        /// Optional monitored server identifier for the source system.
        /// </summary>
        public Guid? ServerId { get; set; }

        /// <summary>
        /// Optional monitored database identifier for the source system.
        /// </summary>
        public Guid? DatabaseId { get; set; }

        /// <summary>
        /// Timestamp when the activity occurred.
        /// </summary>
        public DateTime? EventTime { get; set; }

        /// <summary>
        /// Normalized activity category used by DataSentinel detection rules.
        /// </summary>
        public ActivityEventType? EventType { get; set; }

        /// <summary>
        /// Optional source system label for dedupe-safe imports. Defaults to "BatchImport" when omitted.
        /// </summary>
        public string SourceSystem { get; set; }

        /// <summary>
        /// Optional source-specific event identifier. When omitted, a deterministic fingerprint is generated.
        /// </summary>
        public string SourceEventKey { get; set; }

        /// <summary>
        /// Database actor responsible for the event.
        /// </summary>
        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        public string ObjectName { get; set; }

        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int? DurationMs { get; set; }

        public bool? IsOutOfHours { get; set; }

        public ActivitySeverity? Severity { get; set; }

        public bool? IsSuccess { get; set; }

        /// <summary>
        /// Optional failure description when <see cref="IsSuccess"/> is false.
        /// </summary>
        public string FailureReason { get; set; }

        /// <summary>
        /// Optional event metadata. Sensitive keys are redacted before persistence.
        /// </summary>
        public Dictionary<string, string> Evidence { get; set; }
    }
}
