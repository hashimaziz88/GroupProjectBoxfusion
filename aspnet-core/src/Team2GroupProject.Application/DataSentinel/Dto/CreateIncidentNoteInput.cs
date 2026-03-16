using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class CreateIncidentNoteInput
    {
        public long AlertId { get; set; }

        [Required]
        [StringLength(IncidentNote.MaxBodyLength)]
        public string Body { get; set; }

        public bool IsInternal { get; set; }
    }
}
