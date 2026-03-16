using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace Team2GroupProject.DataSentinel
{
    public class MonitoredServer : FullAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxNameLength = 128;
        public const int MaxHostNameLength = 256;
        public const int MaxEnvironmentNameLength = 64;
        public const int MaxRegionLength = 64;
        public const int MaxDescriptionLength = 1024;

        public int TenantId { get; set; }

        public string Name { get; set; }

        public string HostName { get; set; }

        public string EnvironmentName { get; set; }

        public string Region { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }
    }
}
