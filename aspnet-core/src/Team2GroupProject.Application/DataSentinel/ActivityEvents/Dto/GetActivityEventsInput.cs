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

        /// <summary>Filter by exact actor user (maps to the "All Users" dropdown).</summary>
        public string ActorUser { get; set; }

        /// <summary>Active tab selection: All / SuspiciousActivity / FailedEvents.</summary>
        public ActivityEventTab Tab { get; set; } = ActivityEventTab.All;

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
