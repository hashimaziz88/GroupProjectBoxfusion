using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class MonitoredServerConfiguration : IEntityTypeConfiguration<MonitoredServer>
    {
        public void Configure(EntityTypeBuilder<MonitoredServer> builder)
        {
            builder.ToTable("DsMonitoredServers");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(MonitoredServer.MaxNameLength);

            builder.Property(x => x.HostName)
                .IsRequired()
                .HasMaxLength(MonitoredServer.MaxHostNameLength);

            builder.Property(x => x.EnvironmentName)
                .IsRequired()
                .HasMaxLength(MonitoredServer.MaxEnvironmentNameLength);

            builder.Property(x => x.Region)
                .HasMaxLength(MonitoredServer.MaxRegionLength);

            builder.Property(x => x.Description)
                .HasMaxLength(MonitoredServer.MaxDescriptionLength);

            builder.HasIndex(x => new { x.TenantId, x.Name })
                .IsUnique();

            builder.HasIndex(x => new { x.TenantId, x.HostName });
        }
    }
}
