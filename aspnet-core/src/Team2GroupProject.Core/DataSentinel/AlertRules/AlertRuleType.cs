namespace Team2GroupProject.DataSentinel.AlertRules
{
    /// <summary>
    /// Identifies which detection strategy the rule uses.
    /// Each type maps to a dedicated evaluator in the anomaly detection engine (issue #37).
    /// </summary>
    public enum AlertRuleType
    {
        /// <summary>Fires when a given event type count exceeds a threshold within the time window.</summary>
        ThresholdBased = 0,

        /// <summary>Fires when an actor accumulates N failed login attempts within the time window.</summary>
        RepeatedFailure = 1,

        /// <summary>Fires when a privileged or write action occurs outside configured business hours.</summary>
        OutOfHours = 2,

        /// <summary>Fires when a privileged action is performed (regardless of time).</summary>
        PrivilegedAction = 3,

        /// <summary>Fires when a single operation affects a row count exceeding the threshold.</summary>
        BulkOperation = 4
    }
}
