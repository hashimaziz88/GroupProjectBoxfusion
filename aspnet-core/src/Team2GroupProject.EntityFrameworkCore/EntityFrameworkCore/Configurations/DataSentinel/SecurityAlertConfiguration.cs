using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class SecurityAlertConfiguration : IEntityTypeConfiguration<SecurityAlert>
    {
        public void Configure(EntityTypeBuilder<SecurityAlert> builder)
        {
            builder.ToTable("DsSecurityAlerts");

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(SecurityAlert.MaxTitleLength);

            builder.Property(x => x.Summary)
                .HasMaxLength(SecurityAlert.MaxSummaryLength);

            builder.Property(x => x.PrimaryActorUser)
                .HasMaxLength(SecurityAlert.MaxActorUserLength);

            builder.Property(x => x.PrimaryActorIp)
                .HasMaxLength(SecurityAlert.MaxActorIpLength);

            builder.Property(x => x.TopEvidenceJson)
                .HasColumnType("jsonb");

            builder.HasOne(x => x.Rule)
                .WithMany()
                .HasForeignKey(x => x.RuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.TenantId, x.Status, x.Severity, x.CreationTime });
            builder.HasIndex(x => new { x.TenantId, x.RuleId, x.CreationTime });
            builder.HasIndex(x => new { x.TenantId, x.PrimaryActorUser, x.CreationTime });
        }
    }
}
