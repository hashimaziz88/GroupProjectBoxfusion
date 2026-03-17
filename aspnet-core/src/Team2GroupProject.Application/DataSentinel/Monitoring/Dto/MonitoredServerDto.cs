using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class MonitoredServerDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string HostName { get; set; }

        public string Environment { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastHeartbeatAt { get; set; }

        public List<MonitoredDatabaseDto> Databases { get; set; } = new List<MonitoredDatabaseDto>();
    }
}
