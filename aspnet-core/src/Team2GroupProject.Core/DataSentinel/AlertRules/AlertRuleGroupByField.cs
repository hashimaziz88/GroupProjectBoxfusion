namespace Team2GroupProject.DataSentinel.AlertRules
{
    /// <summary>
    /// Determines how events are grouped when evaluating threshold-based and repeated-failure rules.
    /// For example, grouping by ActorUser means the threshold is applied per distinct user.
    /// </summary>
    public enum AlertRuleGroupByField
    {
        ActorUser = 0,
        ActorIp = 1,
        DatabaseId = 2,
        ObjectName = 3
    }
}
