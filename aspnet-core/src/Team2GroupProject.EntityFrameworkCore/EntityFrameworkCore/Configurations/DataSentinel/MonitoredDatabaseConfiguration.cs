using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class MonitoredDatabaseConfiguration : IEntityTypeConfiguration<MonitoredDatabase>
    {
        public void Configure(EntityTypeBuilder<MonitoredDatabase> builder)
        {
            builder.ToTable("DsMonitoredDatabases");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(MonitoredDatabase.MaxNameLength);

            builder.Property(x => x.Engine)
                .IsRequired()
                .HasMaxLength(MonitoredDatabase.MaxEngineLength);

            builder.Property(x => x.Owner)
                .HasMaxLength(MonitoredDatabase.MaxOwnerLength);

            builder.Property(x => x.Description)
                .HasMaxLength(MonitoredDatabase.MaxDescriptionLength);

            builder.HasOne(x => x.Server)
                .WithMany()
                .HasForeignKey(x => x.ServerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.ServerId, x.Name })
                .IsUnique();
        }
    }
}
