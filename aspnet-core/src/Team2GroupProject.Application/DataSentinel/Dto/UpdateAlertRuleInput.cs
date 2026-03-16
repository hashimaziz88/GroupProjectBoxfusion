using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class UpdateAlertRuleInput
    {
        public long Id { get; set; }

        [Required]
        [StringLength(AlertRule.MaxNameLength)]
        public string Name { get; set; }

        [StringLength(AlertRule.MaxDescriptionLength)]
        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        [Required]
        public AlertRuleType RuleType { get; set; }

        public ActivityEventType? EventType { get; set; }

        [Range(1, 24 * 60)]
        public int WindowMinutes { get; set; }

        [Range(1, 100000)]
        public int ThresholdCount { get; set; }

        [StringLength(AlertRule.MaxGroupByFieldLength)]
        public string GroupByField { get; set; }

        [Required]
        public AlertSeverity Severity { get; set; }
    }
}
