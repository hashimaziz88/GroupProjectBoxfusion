using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class AlertRuleConfiguration : IEntityTypeConfiguration<AlertRule>
    {
        public void Configure(EntityTypeBuilder<AlertRule> builder)
        {
            builder.ToTable("DsAlertRules");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(AlertRule.MaxNameLength);

            builder.Property(x => x.Description)
                .HasMaxLength(AlertRule.MaxDescriptionLength);

            builder.Property(x => x.GroupByField)
                .HasMaxLength(AlertRule.MaxGroupByFieldLength);

            builder.HasIndex(x => new { x.TenantId, x.Name })
                .IsUnique();

            builder.HasIndex(x => new { x.TenantId, x.IsEnabled, x.RuleType });
        }
    }
}
