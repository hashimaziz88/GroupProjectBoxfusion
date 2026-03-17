using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class SecurityAlertConfiguration : IEntityTypeConfiguration<SecurityAlert>
    {
        public void Configure(EntityTypeBuilder<SecurityAlert> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}SecurityAlerts");

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.AlertTitleMaxLength);

            builder.Property(x => x.Summary)
                .HasMaxLength(DataSentinelConsts.AlertSummaryMaxLength);

            builder.Property(x => x.PrimaryActorUser)
                .HasMaxLength(DataSentinelConsts.ActorUserMaxLength);

            builder.Property(x => x.PrimaryActorIp)
                .HasMaxLength(DataSentinelConsts.ActorIpMaxLength);

            builder.Property(x => x.EvidenceSummaryJson)
                .HasColumnType("text");

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.Severity)
                .HasConversion<int>();

            builder.HasOne(x => x.Rule)
                .WithMany()
                .HasForeignKey(x => x.RuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.TriggeringActivityEvent)
                .WithMany()
                .HasForeignKey(x => x.TriggeringActivityEventId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Server)
                .WithMany()
                .HasForeignKey(x => x.ServerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Database)
                .WithMany()
                .HasForeignKey(x => x.DatabaseId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Table)
                .WithMany()
                .HasForeignKey(x => x.TableId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(x => new { x.TenantId, x.Status, x.Severity, x.TriggeredAt });
            builder.HasIndex(x => new { x.TenantId, x.RuleId, x.TriggeredAt });
            builder.HasIndex(x => new { x.TenantId, x.DatabaseId, x.TriggeredAt });
            builder.HasIndex(x => new { x.TenantId, x.PrimaryActorUser, x.TriggeredAt });
        }
    }
}
