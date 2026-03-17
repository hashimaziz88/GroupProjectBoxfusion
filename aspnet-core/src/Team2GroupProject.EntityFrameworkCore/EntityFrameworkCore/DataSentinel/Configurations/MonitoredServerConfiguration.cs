using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class MonitoredServerConfiguration : IEntityTypeConfiguration<MonitoredServer>
    {
        public void Configure(EntityTypeBuilder<MonitoredServer> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}MonitoredServers");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.NameMaxLength);

            builder.Property(x => x.HostName)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.HostNameMaxLength);

            builder.Property(x => x.Environment)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.EnvironmentMaxLength);

            builder.Property(x => x.Description)
                .HasMaxLength(DataSentinelConsts.DescriptionMaxLength);

            builder.HasIndex(x => new { x.TenantId, x.Name });
            builder.HasIndex(x => new { x.TenantId, x.HostName });

            builder.HasMany(x => x.Databases)
                .WithOne(x => x.Server)
                .HasForeignKey(x => x.ServerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
