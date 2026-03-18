using System;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class SecurityAlertDto
    {
        public Guid Id { get; set; }

        /// <summary>Human-readable alert identifier, e.g. "ALT-2024-0316-A3F".</summary>
        public string AlertId { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public ActivitySeverity Severity { get; set; }

        /// <summary>Derived risk score (0-100) based on severity and related event count.</summary>
        public int RiskScore { get; set; }

        public SecurityAlertStatus Status { get; set; }

        public DateTime TriggeredAt { get; set; }

        public Guid? DatabaseId { get; set; }

        public string DatabaseName { get; set; }

        public Guid? TableId { get; set; }

        public string TableName { get; set; }

        public string PrimaryActorUser { get; set; }
    }
}
