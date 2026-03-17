using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    /// <summary>
    /// Append-only analyst note attached to a security alert.
    /// Uses CreationAuditedEntity so CreationTime/CreatorUserId represent who recorded the note and when.
    /// </summary>
    public class IncidentNote : CreationAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public Guid AlertId { get; set; }

        public string Body { get; set; }

        public bool IsInternal { get; set; }

        public SecurityAlert Alert { get; set; }

        protected IncidentNote()
        {
        }

        public IncidentNote(
            int tenantId,
            Guid alertId,
            string body,
            bool isInternal)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            AlertId = alertId;
            Body = body.Trim();
            IsInternal = isInternal;
        }
    }
}
