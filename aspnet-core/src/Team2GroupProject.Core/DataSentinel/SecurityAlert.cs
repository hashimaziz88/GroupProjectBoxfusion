using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    public class SecurityAlert : FullAuditedEntity<long>, IMustHaveTenant
    {
        public const int MaxTitleLength = 256;
        public const int MaxSummaryLength = 2000;
        public const int MaxActorUserLength = 256;
        public const int MaxActorIpLength = 64;

        public int TenantId { get; set; }

        public long RuleId { get; set; }

        public SecurityAlertStatus Status { get; set; }

        public AlertSeverity Severity { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public string PrimaryActorUser { get; set; }

        public string PrimaryActorIp { get; set; }

        public DateTime EventTimeStart { get; set; }

        public DateTime EventTimeEnd { get; set; }

        public int RelatedEventCount { get; set; }

        public string TopEvidenceJson { get; set; }

        public virtual AlertRule Rule { get; set; }
    }
}
