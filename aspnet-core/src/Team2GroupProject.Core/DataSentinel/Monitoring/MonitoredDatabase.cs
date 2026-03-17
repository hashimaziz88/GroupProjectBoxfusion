using System;
using System.Collections.Generic;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public class MonitoredDatabase : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public Guid ServerId { get; set; }

        public string Name { get; set; }

        public string Engine { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastActivityAt { get; set; }

        public MonitoredServer Server { get; set; }

        public ICollection<MonitoredTable> Tables { get; set; }

        protected MonitoredDatabase()
        {
            Tables = new List<MonitoredTable>();
        }

        public MonitoredDatabase(
            int tenantId,
            Guid serverId,
            string name,
            string engine,
            string description,
            bool isEnabled = true)
            : this()
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            ServerId = serverId;
            Name = name.Trim();
            Engine = engine.Trim();
            Description = description.IsNullOrWhiteSpace() ? null : description.Trim();
            IsEnabled = isEnabled;
        }
    }
}
