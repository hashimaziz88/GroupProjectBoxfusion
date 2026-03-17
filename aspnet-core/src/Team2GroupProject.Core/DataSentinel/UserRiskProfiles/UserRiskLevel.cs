namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    /// <summary>
    /// Coarse risk classification derived from RiskScore for dashboard display and filtering.
    /// Stored as a column so queries can filter by level without recomputing from the score.
    /// </summary>
    public enum UserRiskLevel
    {
        None = 0,
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
}
