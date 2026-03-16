using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    public class ActivityEvent : CreationAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxActorUserLength = 256;
        public const int MaxActorIpLength = 64;
        public const int MaxObjectNameLength = 256;
        public const int MaxOperationLength = 128;
        public const int MaxFailureReasonLength = 512;
        public const int MaxQuerySignatureLength = 256;

        public int TenantId { get; set; }

        public long ServerId { get; set; }

        public long DatabaseId { get; set; }

        public DateTime EventTime { get; set; }

        public ActivityEventType EventType { get; set; }

        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        public string ObjectName { get; set; }

        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int DurationMs { get; set; }

        public bool IsOutOfHours { get; set; }

        public bool IsSuccessful { get; set; }

        public bool IsPrivilegedAction { get; set; }

        public AlertSeverity Severity { get; set; }

        public string QuerySignature { get; set; }

        public string FailureReason { get; set; }

        public string EvidenceJson { get; set; }

        public virtual MonitoredServer Server { get; set; }

        public virtual MonitoredDatabase Database { get; set; }
    }
}
