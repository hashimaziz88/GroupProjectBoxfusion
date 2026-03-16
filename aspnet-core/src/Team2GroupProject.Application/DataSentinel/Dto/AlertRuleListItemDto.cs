using System;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class AlertRuleListItemDto
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public AlertRuleType RuleType { get; set; }

        public ActivityEventType? EventType { get; set; }

        public int WindowMinutes { get; set; }

        public int ThresholdCount { get; set; }

        public string GroupByField { get; set; }

        public AlertSeverity Severity { get; set; }

        public int TriggeredAlertCount { get; set; }

        public DateTime? LastTriggeredAt { get; set; }
    }
}
