namespace Team2GroupProject.DataSentinel.Enums
{
    public enum AlertRuleType
    {
        Unknown = 0,
        RepeatedFailedLogins = 1,
        OutOfHoursPrivilegedAction = 2,
        ExcessiveWriteSpike = 3,
        LargeRead = 4,
        SuspiciousAccessPattern = 5,
        CompositeEscalation = 6
    }
}
