using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.EntityFrameworkCore.Configurations.DataSentinel
{
    public class IncidentNoteConfiguration : IEntityTypeConfiguration<IncidentNote>
    {
        public void Configure(EntityTypeBuilder<IncidentNote> builder)
        {
            builder.ToTable("DsIncidentNotes");

            builder.Property(x => x.Body)
                .IsRequired()
                .HasMaxLength(IncidentNote.MaxBodyLength);

            builder.HasOne(x => x.Alert)
                .WithMany()
                .HasForeignKey(x => x.AlertId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.TenantId, x.AlertId, x.CreationTime });
        }
    }
}
