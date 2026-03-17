using System;
using System.Collections.Generic;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public class MonitoredServer : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public string Name { get; set; }

        public string HostName { get; set; }

        public string Environment { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastHeartbeatAt { get; set; }

        public ICollection<MonitoredDatabase> Databases { get; set; }

        protected MonitoredServer()
        {
            Databases = new List<MonitoredDatabase>();
        }

        public MonitoredServer(
            int tenantId,
            string name,
            string hostName,
            string environment,
            string description,
            bool isEnabled = true)
            : this()
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            Name = name.Trim();
            HostName = hostName.Trim();
            Environment = environment.Trim();
            Description = description.IsNullOrWhiteSpace() ? null : description.Trim();
            IsEnabled = isEnabled;
        }
    }
}
