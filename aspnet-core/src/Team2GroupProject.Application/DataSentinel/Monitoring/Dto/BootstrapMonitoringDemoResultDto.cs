using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class BootstrapMonitoringDemoResultDto
    {
        public int CreatedServersCount { get; set; }

        public int CreatedDatabasesCount { get; set; }

        public int CreatedTablesCount { get; set; }

        public List<MonitoredServerDto> Servers { get; set; } = new List<MonitoredServerDto>();
    }
}
