using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class AlertStatusHistoryConfiguration : IEntityTypeConfiguration<AlertStatusHistory>
    {
        public void Configure(EntityTypeBuilder<AlertStatusHistory> builder)
        {
            builder.ToTable("DsAlertStatusHistory");

            builder.Property(x => x.Comment)
                .HasMaxLength(AlertStatusHistory.MaxCommentLength);

            builder.HasOne(x => x.Alert)
                .WithMany()
                .HasForeignKey(x => x.AlertId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.AlertId, x.CreationTime });
        }
    }
}
