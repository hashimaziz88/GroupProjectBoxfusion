using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class UserRiskProfileConfiguration : IEntityTypeConfiguration<UserRiskProfile>
    {
        public void Configure(EntityTypeBuilder<UserRiskProfile> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}UserRiskProfiles");

            builder.Property(x => x.ActorUser)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.ActorUserMaxLength);

            builder.Property(x => x.ActorIp)
                .HasMaxLength(DataSentinelConsts.ActorIpMaxLength);

            builder.Property(x => x.RiskLevel)
                .HasConversion<int>();

            // One profile per actor per tenant — enforced at the DB level.
            builder.HasIndex(x => new { x.TenantId, x.ActorUser })
                .IsUnique();

            // Top risky users dashboard query (issue #48): ORDER BY RiskScore DESC
            builder.HasIndex(x => new { x.TenantId, x.RiskScore });

            // Risk level filter panel on dashboard
            builder.HasIndex(x => new { x.TenantId, x.RiskLevel });

            // Scoring engine stale-profile detection
            builder.HasIndex(x => new { x.TenantId, x.LastEvaluatedAt });
        }
    }
}
