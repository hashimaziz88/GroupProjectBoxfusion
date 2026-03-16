using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace Team2GroupProject.DataSentinel
{
    public class MonitoredDatabase : FullAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxNameLength = 128;
        public const int MaxEngineLength = 64;
        public const int MaxOwnerLength = 128;
        public const int MaxDescriptionLength = 1024;

        public int TenantId { get; set; }

        public long ServerId { get; set; }

        public string Name { get; set; }

        public string Engine { get; set; }

        public string Owner { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }

        public virtual MonitoredServer Server { get; set; }
    }
}
