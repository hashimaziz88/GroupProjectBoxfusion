using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;
using Abp.UI;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.AlertRules
{
    /// <summary>
    /// A configurable detection rule evaluated by the anomaly detection engine (issue #37).
    /// Rules are managed entities — they can be enabled, disabled, and edited, so FullAuditedEntity is appropriate.
    /// </summary>
    public class AlertRule : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public AlertRuleType RuleType { get; set; }

        /// <summary>
        /// The event type this rule applies to.
        /// Null means the rule evaluates against all event types (e.g. OutOfHours applies to any event).
        /// </summary>
        public ActivityEventType? EventType { get; set; }

        /// <summary>
        /// Length of the rolling time window in minutes used for threshold evaluation.
        /// Must be positive. Ignored for OutOfHours and PrivilegedAction rule types.
        /// </summary>
        public int WindowMinutes { get; set; }

        /// <summary>
        /// Number of matching events within the window that triggers an alert.
        /// Must be positive. Ignored for OutOfHours and PrivilegedAction rule types.
        /// </summary>
        public int ThresholdCount { get; set; }

        /// <summary>
        /// Specifies how events are partitioned when checking the threshold.
        /// Null means the rule evaluates the global count, not per-group.
        /// </summary>
        public AlertRuleGroupByField? GroupByField { get; set; }

        /// <summary>The severity assigned to alerts created by this rule.</summary>
        public ActivitySeverity Severity { get; set; }

        protected AlertRule()
        {
        }

        public AlertRule(
            int tenantId,
            string name,
            AlertRuleType ruleType,
            ActivitySeverity severity,
            int windowMinutes,
            int thresholdCount,
            bool isEnabled = true)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            Name = name.Trim();
            RuleType = ruleType;
            Severity = severity;
            WindowMinutes = windowMinutes;
            ThresholdCount = thresholdCount;
            IsEnabled = isEnabled;

            NormalizeForRuleType();
            EnsureConfigurationIsValid();
        }

        public void EnsureConfigurationIsValid()
        {
            if (Name.IsNullOrWhiteSpace())
            {
                throw new UserFriendlyException("Alert rule name is required.");
            }

            switch (RuleType)
            {
                case AlertRuleType.ThresholdBased:
                case AlertRuleType.RepeatedFailure:
                case AlertRuleType.BulkOperation:
                    if (WindowMinutes <= 0)
                    {
                        throw new UserFriendlyException($"{RuleType} rules require WindowMinutes to be greater than 0.");
                    }

                    if (ThresholdCount <= 0)
                    {
                        throw new UserFriendlyException($"{RuleType} rules require ThresholdCount to be greater than 0.");
                    }

                    break;

                case AlertRuleType.OutOfHours:
                case AlertRuleType.PrivilegedAction:
                    NormalizeForRuleType();
                    break;

                default:
                    throw new UserFriendlyException($"Unsupported alert rule type: {RuleType}.");
            }
        }

        private void NormalizeForRuleType()
        {
            if (RuleType == AlertRuleType.OutOfHours || RuleType == AlertRuleType.PrivilegedAction)
            {
                WindowMinutes = 0;
                ThresholdCount = 1;
            }
        }
    }
}
