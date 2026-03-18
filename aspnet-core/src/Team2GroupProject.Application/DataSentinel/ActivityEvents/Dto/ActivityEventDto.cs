using System;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventDto
    {
        public Guid Id { get; set; }

        /// <summary>Formatted display ID: EVT-yyyyMMdd-HHmmss</summary>
        public string EventId { get; set; }

        public DateTime EventTime { get; set; }

        public ActivityEventType EventType { get; set; }

        public ActivitySeverity Severity { get; set; }

        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        /// <summary>Schema-qualified table/object name (e.g. "public.orders").</summary>
        public string ObjectName { get; set; }

        /// <summary>SQL operation keyword: SELECT, INSERT, UPDATE, DELETE, CONNECT, etc.</summary>
        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int? DurationMs { get; set; }

        public bool IsOutOfHours { get; set; }

        public bool IsSuccess { get; set; }

        public string FailureReason { get; set; }

        public Guid? DatabaseId { get; set; }

        /// <summary>Name of the monitored database. Null when the event is not linked to a known database.</summary>
        public string DatabaseName { get; set; }

        public Guid? ServerId { get; set; }

        /// <summary>
        /// Short display snippet for the Query Preview column.
        /// Built from Operation + ObjectName (e.g. "SELECT public.customers").
        /// </summary>
        public string QueryPreview { get; set; }
    }
}
