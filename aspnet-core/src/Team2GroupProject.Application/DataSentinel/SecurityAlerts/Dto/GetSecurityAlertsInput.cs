using System;
using Abp.Runtime.Validation;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class GetSecurityAlertsInput : IShouldNormalize
    {
        /// <summary>Free-text search over Title, Summary, and PrimaryActorUser.</summary>
        public string Keyword { get; set; }

        /// <summary>Filter by severity level (maps to the "All Severities" dropdown).</summary>
        public ActivitySeverity? Severity { get; set; }

        /// <summary>Filter by review status (maps to the "All Statuses" dropdown).</summary>
        public SecurityAlertStatus? Status { get; set; }

        /// <summary>Filter by monitored database ID (maps to the "All Databases" dropdown).</summary>
        public Guid? DatabaseId { get; set; }

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
