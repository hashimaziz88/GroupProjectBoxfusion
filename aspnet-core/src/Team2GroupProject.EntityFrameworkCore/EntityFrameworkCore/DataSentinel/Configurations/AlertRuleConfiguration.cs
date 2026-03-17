using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.AlertRules;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class AlertRuleConfiguration : IEntityTypeConfiguration<AlertRule>
    {
        public void Configure(EntityTypeBuilder<AlertRule> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}AlertRules");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.NameMaxLength);

            builder.Property(x => x.Description)
                .HasMaxLength(DataSentinelConsts.DescriptionMaxLength);

            builder.Property(x => x.RuleType)
                .HasConversion<int>();

            builder.Property(x => x.EventType)
                .HasConversion<int?>();

            builder.Property(x => x.GroupByField)
                .HasConversion<int?>();

            builder.Property(x => x.Severity)
                .HasConversion<int>();

            // Detection engine loads active rules per tenant on each evaluation pass
            builder.HasIndex(x => new { x.TenantId, x.IsEnabled });

            // Allows loading only the relevant rule type's entries (e.g. just RepeatedFailure rules)
            builder.HasIndex(x => new { x.TenantId, x.RuleType, x.IsEnabled });
        }
    }
}
