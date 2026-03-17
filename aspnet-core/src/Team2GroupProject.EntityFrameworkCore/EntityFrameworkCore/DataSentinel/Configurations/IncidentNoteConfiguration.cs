using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations
{
    public class IncidentNoteConfiguration : IEntityTypeConfiguration<IncidentNote>
    {
        public void Configure(EntityTypeBuilder<IncidentNote> builder)
        {
            builder.ToTable($"{DataSentinelConsts.DbTablePrefix}IncidentNotes");

            builder.Property(x => x.Body)
                .IsRequired()
                .HasMaxLength(DataSentinelConsts.IncidentNoteBodyMaxLength);

            builder.HasOne(x => x.Alert)
                .WithMany(x => x.Notes)
                .HasForeignKey(x => x.AlertId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.AlertId, x.CreationTime });
        }
    }
}
