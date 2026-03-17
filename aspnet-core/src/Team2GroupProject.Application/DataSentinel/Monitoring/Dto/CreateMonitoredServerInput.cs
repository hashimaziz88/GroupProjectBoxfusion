using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class CreateMonitoredServerInput
    {
        [Required]
        [StringLength(DataSentinelConsts.NameMaxLength)]
        public string Name { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.HostNameMaxLength)]
        public string HostName { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.EnvironmentMaxLength)]
        public string Environment { get; set; }

        [StringLength(DataSentinelConsts.DescriptionMaxLength)]
        public string Description { get; set; }

        public bool IsEnabled { get; set; } = true;
    }
}
