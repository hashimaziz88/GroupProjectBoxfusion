using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class AlertStatusHistoryConfiguration : IEntityTypeConfiguration<AlertStatusHistory>
    {
        public void Configure(EntityTypeBuilder<AlertStatusHistory> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}AlertStatusHistory");

            builder.Property(x => x.FromStatus)
                .HasConversion<int>();

            builder.Property(x => x.ToStatus)
                .HasConversion<int>();

            builder.Property(x => x.Comment)
                .HasMaxLength(DataSentinelConsts.StatusHistoryCommentMaxLength);

            builder.HasOne(x => x.Alert)
                .WithMany(x => x.StatusHistoryEntries)
                .HasForeignKey(x => x.AlertId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.AlertId, x.CreationTime });
            builder.HasIndex(x => new { x.TenantId, x.AlertId, x.ToStatus, x.CreationTime });
        }
    }
}
