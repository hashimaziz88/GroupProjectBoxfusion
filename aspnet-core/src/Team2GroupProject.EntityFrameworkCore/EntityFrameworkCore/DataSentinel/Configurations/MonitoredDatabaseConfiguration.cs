using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class MonitoredDatabaseConfiguration : IEntityTypeConfiguration<MonitoredDatabase>
    {
        public void Configure(EntityTypeBuilder<MonitoredDatabase> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}MonitoredDatabases");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.NameMaxLength);

            builder.Property(x => x.Engine)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.EngineMaxLength);

            builder.Property(x => x.Description)
                .HasMaxLength(DataSentinelConsts.DescriptionMaxLength);

            builder.HasIndex(x => new { x.TenantId, x.ServerId, x.Name });
            builder.HasIndex(x => new { x.TenantId, x.Engine });

            builder.HasMany(x => x.Tables)
                .WithOne(x => x.Database)
                .HasForeignKey(x => x.DatabaseId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
