namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class UserRiskProfileSummaryDto
    {
        /// <summary>Total number of tracked actor profiles for this tenant.</summary>
        public int TotalUsers { get; set; }

        /// <summary>Number of profiles with RiskLevel High or Critical.</summary>
        public int HighRiskUsers { get; set; }

        /// <summary>Number of profiles with Status set to Monitored.</summary>
        public int MonitoredAccounts { get; set; }

        /// <summary>Sum of AlertCount across all profiles.</summary>
        public int TotalAlerts { get; set; }
    }
}
