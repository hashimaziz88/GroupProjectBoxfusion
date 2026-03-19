namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    public enum UserProfileStatus
    {
        /// <summary>No special action taken. Default state.</summary>
        Normal = 0,

        /// <summary>Analyst has flagged this actor for enhanced surveillance.</summary>
        Monitored = 1,

        /// <summary>Analyst has marked this actor as suspended on the monitored system.</summary>
        Suspended = 2
    }
}
