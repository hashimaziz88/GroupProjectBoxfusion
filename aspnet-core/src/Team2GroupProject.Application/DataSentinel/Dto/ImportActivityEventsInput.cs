using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class ImportActivityEventsInput
    {
        [Required]
        public string PayloadJson { get; set; }

        public bool RunDetection { get; set; } = true;
    }
}
