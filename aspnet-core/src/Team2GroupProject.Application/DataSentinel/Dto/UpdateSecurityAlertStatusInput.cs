using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class UpdateSecurityAlertStatusInput
    {
        public long AlertId { get; set; }

        [Required]
        public SecurityAlertStatus Status { get; set; }

        [StringLength(AlertStatusHistory.MaxCommentLength)]
        public string Comment { get; set; }
    }
}
