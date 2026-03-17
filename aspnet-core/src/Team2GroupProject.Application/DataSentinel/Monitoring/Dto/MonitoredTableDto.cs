using System;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class MonitoredTableDto
    {
        public Guid Id { get; set; }

        public Guid DatabaseId { get; set; }

        public string SchemaName { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastActivityAt { get; set; }
    }
}
