using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class ActivityEventConfiguration : IEntityTypeConfiguration<ActivityEvent>
    {
        public void Configure(EntityTypeBuilder<ActivityEvent> builder)
        {
            builder.ToTable("DsActivityEvents");

            builder.Property(x => x.ActorUser)
                .HasMaxLength(ActivityEvent.MaxActorUserLength);

            builder.Property(x => x.ActorIp)
                .HasMaxLength(ActivityEvent.MaxActorIpLength);

            builder.Property(x => x.ObjectName)
                .HasMaxLength(ActivityEvent.MaxObjectNameLength);

            builder.Property(x => x.Operation)
                .HasMaxLength(ActivityEvent.MaxOperationLength);

            builder.Property(x => x.QuerySignature)
                .HasMaxLength(ActivityEvent.MaxQuerySignatureLength);

            builder.Property(x => x.FailureReason)
                .HasMaxLength(ActivityEvent.MaxFailureReasonLength);

            builder.Property(x => x.EvidenceJson)
                .HasColumnType("jsonb");

            builder.HasOne(x => x.Server)
                .WithMany()
                .HasForeignKey(x => x.ServerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Database)
                .WithMany()
                .HasForeignKey(x => x.DatabaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.EventTime });
            builder.HasIndex(x => new { x.TenantId, x.DatabaseId, x.EventTime });
            builder.HasIndex(x => new { x.TenantId, x.ActorUser, x.EventTime });
            builder.HasIndex(x => new { x.TenantId, x.ActorIp, x.EventTime });
            builder.HasIndex(x => new { x.TenantId, x.EventType, x.EventTime });
        }
    }
}
