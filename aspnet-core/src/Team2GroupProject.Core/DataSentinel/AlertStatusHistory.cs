using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    public class AlertStatusHistory : CreationAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxCommentLength = 1000;

        public int TenantId { get; set; }

        public long AlertId { get; set; }

        public SecurityAlertStatus FromStatus { get; set; }

        public SecurityAlertStatus ToStatus { get; set; }

        public string Comment { get; set; }

        public virtual SecurityAlert Alert { get; set; }
    }
}
