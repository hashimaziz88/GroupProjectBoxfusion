using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    public class AlertRule : FullAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxNameLength = 128;
        public const int MaxDescriptionLength = 1024;
        public const int MaxGroupByFieldLength = 64;

        public int TenantId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public AlertRuleType RuleType { get; set; }

        public ActivityEventType? EventType { get; set; }

        public int WindowMinutes { get; set; }

        public int ThresholdCount { get; set; }

        public string GroupByField { get; set; }

        public AlertSeverity Severity { get; set; }
    }
}
