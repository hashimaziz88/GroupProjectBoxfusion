using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    /// <summary>
    /// Append-only record of a security alert status transition.
    /// CreationTime/CreatorUserId represent when the change was recorded and by whom.
    /// </summary>
    public class AlertStatusHistory : CreationAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public Guid AlertId { get; set; }

        public SecurityAlertStatus FromStatus { get; set; }

        public SecurityAlertStatus ToStatus { get; set; }

        public string Comment { get; set; }

        public SecurityAlert Alert { get; set; }

        protected AlertStatusHistory()
        {
        }

        public AlertStatusHistory(
            int tenantId,
            Guid alertId,
            SecurityAlertStatus fromStatus,
            SecurityAlertStatus toStatus,
            string comment = null)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            AlertId = alertId;
            FromStatus = fromStatus;
            ToStatus = toStatus;
            Comment = comment.IsNullOrWhiteSpace() ? null : comment.Trim();
        }
    }
}
