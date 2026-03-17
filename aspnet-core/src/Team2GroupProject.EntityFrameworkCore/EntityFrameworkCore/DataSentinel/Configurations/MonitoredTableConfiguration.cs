using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class MonitoredTableConfiguration : IEntityTypeConfiguration<MonitoredTable>
    {
        public void Configure(EntityTypeBuilder<MonitoredTable> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}MonitoredTables");

            builder.Property(x => x.SchemaName)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.SchemaNameMaxLength);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.NameMaxLength);

            builder.Property(x => x.Description)
                .HasMaxLength(DataSentinelConsts.DescriptionMaxLength);

            builder.HasIndex(x => new { x.TenantId, x.DatabaseId, x.SchemaName, x.Name });
            builder.HasIndex(x => new { x.TenantId, x.Name });
        }
    }
}
