using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class GenerateDemoActivityInput
    {
        [Range(25, 2000)]
        public int EventCount { get; set; } = 160;

        [Range(1, int.MaxValue)]
        public int Seed { get; set; } = 42;

        public bool IncludeAnomalies { get; set; } = true;

        public bool RunDetection { get; set; } = true;
    }
}
