using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public class MonitoredTable : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public Guid DatabaseId { get; set; }

        public string SchemaName { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public DateTime? LastActivityAt { get; set; }

        public MonitoredDatabase Database { get; set; }

        protected MonitoredTable()
        {
        }

        public MonitoredTable(
            int tenantId,
            Guid databaseId,
            string schemaName,
            string name,
            string description,
            bool isEnabled = true)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            DatabaseId = databaseId;
            SchemaName = schemaName.Trim();
            Name = name.Trim();
            Description = description.IsNullOrWhiteSpace() ? null : description.Trim();
            IsEnabled = isEnabled;
        }
    }
}
