using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class ActivityEventConfiguration : IEntityTypeConfiguration<ActivityEvent>
    {
        public void Configure(EntityTypeBuilder<ActivityEvent> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}ActivityEvents");

            builder.Property(x => x.ActorUser)
                .HasMaxLength(DataSentinelConsts.ActorUserMaxLength);

            builder.Property(x => x.ActorIp)
                .HasMaxLength(DataSentinelConsts.ActorIpMaxLength);

            builder.Property(x => x.ObjectName)
                .HasMaxLength(DataSentinelConsts.ObjectNameMaxLength);

            builder.Property(x => x.Operation)
                .HasMaxLength(DataSentinelConsts.OperationMaxLength);

            builder.Property(x => x.FailureReason)
                .HasMaxLength(DataSentinelConsts.FailureReasonMaxLength);

            builder.Property(x => x.SourceSystem)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.SourceSystemMaxLength);

            builder.Property(x => x.SourceEventKey)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.SourceEventKeyMaxLength);

            // EvidenceJson is unbounded text — no HasMaxLength
            builder.Property(x => x.EvidenceJson)
                .HasColumnType("text");

            // Enums stored as integers
            builder.Property(x => x.EventType)
                .HasConversion<int>();

            builder.Property(x => x.Severity)
                .HasConversion<int>();

            // FK to MonitoredServer (optional)
            builder.HasOne(x => x.Server)
                .WithMany()
                .HasForeignKey(x => x.ServerId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // FK to MonitoredDatabase (optional)
            builder.HasOne(x => x.Database)
                .WithMany()
                .HasForeignKey(x => x.DatabaseId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Primary query index: tenant + time range (most common filter pattern)
            builder.HasIndex(x => new { x.TenantId, x.EventTime });

            // Per-database event queries and drill-down
            builder.HasIndex(x => new { x.TenantId, x.DatabaseId, x.EventTime });

            // Actor-based queries (risk scoring, failure detection)
            builder.HasIndex(x => new { x.TenantId, x.ActorUser, x.EventTime });

            // Severity queue queries (alert dashboard, severity filter)
            builder.HasIndex(x => new { x.TenantId, x.Severity, x.EventTime });

            // Event type filtering (anomaly detection threshold rules)
            builder.HasIndex(x => new { x.TenantId, x.EventType, x.EventTime });

            // Failed event queries (repeated failure detection rule)
            builder.HasIndex(x => new { x.TenantId, x.IsSuccess, x.EventTime });

            // Import dedupe and replay safety
            builder.HasIndex(x => new { x.TenantId, x.SourceSystem, x.SourceEventKey })
                .IsUnique();
        }
    }
}
