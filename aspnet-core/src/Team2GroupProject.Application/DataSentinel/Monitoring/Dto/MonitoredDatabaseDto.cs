using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class MonitoredDatabaseDto
    {
        public Guid Id { get; set; }

        public Guid ServerId { get; set; }

        public string Name { get; set; }

        public string Engine { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastActivityAt { get; set; }

        public List<MonitoredTableDto> Tables { get; set; } = new List<MonitoredTableDto>();
    }
}
