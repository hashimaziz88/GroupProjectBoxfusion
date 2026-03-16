using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;

namespace Team2GroupProject.DataSentinel
{
    public class IncidentNote : CreationAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxBodyLength = 2000;

        public int TenantId { get; set; }

        public long AlertId { get; set; }

        public string Body { get; set; }

        public bool IsInternal { get; set; }

        public virtual SecurityAlert Alert { get; set; }
    }
}
