using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class BootstrapMonitoringDemoInput
    {
        [StringLength(DataSentinelConsts.NameMaxLength)]
        public string ServerName { get; set; } = "Demo PostgreSQL Cluster";

        [StringLength(DataSentinelConsts.HostNameMaxLength)]
        public string HostName { get; set; }

        [StringLength(DataSentinelConsts.EnvironmentMaxLength)]
        public string Environment { get; set; } = "Demo";

        public bool IncludeTables { get; set; } = true;
    }
}
