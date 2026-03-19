using System;

namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class DashboardSummaryDto
    {
        public DateTime WindowStartUtc { get; set; }

        public DateTime WindowEndUtc { get; set; }

        public int TotalAlerts { get; set; }

        public int CriticalAlerts { get; set; }

        public int NewAlerts { get; set; }

        public int TotalFailedAccessAttempts { get; set; }

        public int SuspiciousWriteActivityCount { get; set; }

        public int HighRiskUsersCount { get; set; }
    }
}
