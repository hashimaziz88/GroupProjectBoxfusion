using System;
using Abp.Runtime.Validation;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public enum ActivityEventTab
    {
        All = 0,
        SuspiciousActivity = 1,
        FailedEvents = 2
    }

    public class GetActivityEventsInput : IShouldNormalize
    {
        /// <summary>Free-text search over ActorUser, ObjectName, Operation, and FailureReason.</summary>
        public string Keyword { get; set; }

        /// <summary>Filter by event type (maps to the "All Event Types" dropdown).</summary>
        public ActivityEventType? EventType { get; set; }

        /// <summary>Filter by monitored database ID (maps to the "All Databases" dropdown).</summary>
        public Guid? DatabaseId { get; set; }

        /// <summary>Filter by monitored server ID.</summary>
        public Guid? ServerId { get; set; }

        /// <summary>Filter by exact actor user (maps to the "All Users" dropdown).</summary>
        public string ActorUser { get; set; }

        /// <summary>Filter by exact actor IP address.</summary>
        public string ActorIp { get; set; }

        /// <summary>Filter by exact operation keyword (e.g. SELECT, INSERT).</summary>
        public string Operation { get; set; }

        /// <summary>Filter by minimum severity level.</summary>
        public ActivitySeverity? Severity { get; set; }

        /// <summary>Filter by success or failure outcome.</summary>
        public bool? IsSuccess { get; set; }

        /// <summary>Return only events at or after this UTC datetime.</summary>
        public DateTime? StartDate { get; set; }

        /// <summary>Return only events at or before this UTC datetime.</summary>
        public DateTime? EndDate { get; set; }

        /// <summary>Active tab selection: All / SuspiciousActivity / FailedEvents.</summary>
        public ActivityEventTab Tab { get; set; } = ActivityEventTab.All;

        /// <summary>When true (default), results are sorted newest first. Set to false for oldest first.</summary>
        public bool SortDescending { get; set; } = true;

        public int SkipCount { get; set; }

        public int MaxResultCount { get; set; } = 50;

        public void Normalize()
        {
            if (MaxResultCount <= 0 || MaxResultCount > 100)
            {
                MaxResultCount = 50;
            }

            if (SkipCount < 0)
            {
                SkipCount = 0;
            }
        }
    }
}
