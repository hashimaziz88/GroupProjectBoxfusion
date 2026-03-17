namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventSummaryDto
    {
        public int TotalEvents { get; set; }

        public int ReadOps { get; set; }

        public int WriteOps { get; set; }

        /// <summary>Count of Login + Logout events.</summary>
        public int AuthEvents { get; set; }

        public int PrivilegedOps { get; set; }

        /// <summary>Count for the Suspicious Activity tab badge (Severity >= Medium).</summary>
        public int SuspiciousActivityCount { get; set; }

        /// <summary>Count for the Failed Events tab badge.</summary>
        public int FailedEventsCount { get; set; }
    }
}
