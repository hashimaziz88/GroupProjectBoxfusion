using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    /// <summary>
    /// Represents a single persisted database activity record ingested by DataSentinel.
    /// Events are immutable once created — CreationAuditedEntity is intentional.
    /// </summary>
    public class ActivityEvent : CreationAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        /// <summary>Optional FK to the monitored server where the event originated.</summary>
        public Guid? ServerId { get; set; }

        /// <summary>Optional FK to the monitored database where the event originated.</summary>
        public Guid? DatabaseId { get; set; }

        /// <summary>The timestamp when the activity occurred in the monitored system.</summary>
        public DateTime EventTime { get; set; }

        public ActivityEventType EventType { get; set; }

        /// <summary>The database user or login that performed the action.</summary>
        public string ActorUser { get; set; }

        /// <summary>Source IP address of the connection. Null if unavailable.</summary>
        public string ActorIp { get; set; }

        /// <summary>Schema-qualified object name (e.g. "public.users"). Null for non-object events.</summary>
        public string ObjectName { get; set; }

        /// <summary>The SQL operation type (SELECT, INSERT, UPDATE, DELETE, etc.).</summary>
        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int? DurationMs { get; set; }

        /// <summary>True when the event occurred outside normal business hours (used by out-of-hours detection rules).</summary>
        public bool IsOutOfHours { get; set; }

        public ActivitySeverity Severity { get; set; }

        public bool IsSuccess { get; set; }

        /// <summary>Human-readable failure description. Only populated when IsSuccess is false.</summary>
        public string FailureReason { get; set; }

        /// <summary>
        /// Sanitized metadata JSON for anomaly detection context.
        /// Sensitive values (credentials, tokens) must be redacted before storage.
        /// </summary>
        public string EvidenceJson { get; set; }

        // Navigation properties — loaded explicitly; not eagerly included by default.
        public MonitoredServer Server { get; set; }
        public MonitoredDatabase Database { get; set; }

        protected ActivityEvent()
        {
        }

        public ActivityEvent(
            int tenantId,
            DateTime eventTime,
            ActivityEventType eventType,
            string actorUser,
            ActivitySeverity severity,
            bool isSuccess)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            EventTime = eventTime;
            EventType = eventType;
            ActorUser = actorUser.IsNullOrWhiteSpace() ? null : actorUser.Trim();
            Severity = severity;
            IsSuccess = isSuccess;
        }
    }
}
