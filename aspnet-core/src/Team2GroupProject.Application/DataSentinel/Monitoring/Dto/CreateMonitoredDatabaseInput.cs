using System;
using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class CreateMonitoredDatabaseInput
    {
        [Required]
        public Guid ServerId { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.NameMaxLength)]
        public string Name { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.EngineMaxLength)]
        public string Engine { get; set; }

        [StringLength(DataSentinelConsts.DescriptionMaxLength)]
        public string Description { get; set; }

        public bool IsEnabled { get; set; } = true;
    }
}
