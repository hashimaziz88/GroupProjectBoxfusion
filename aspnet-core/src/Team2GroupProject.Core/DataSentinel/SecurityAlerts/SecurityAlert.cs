using System;
using System.Collections.Generic;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    /// <summary>
    /// Represents a suspicious incident produced by deterministic anomaly detection.
    /// The alert is mutable because analysts will move it through a review lifecycle.
    /// </summary>
    public class SecurityAlert : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public Guid RuleId { get; set; }

        public Guid? TriggeringActivityEventId { get; set; }

        public Guid? ServerId { get; set; }

        public Guid? DatabaseId { get; set; }

        public Guid? TableId { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public ActivitySeverity Severity { get; set; }

        public SecurityAlertStatus Status { get; private set; }

        public DateTime TriggeredAt { get; set; }

        public DateTime EventTimeStart { get; set; }

        public DateTime EventTimeEnd { get; set; }

        public int RelatedEventCount { get; set; }

        public string PrimaryActorUser { get; set; }

        public string PrimaryActorIp { get; set; }

        public string EvidenceSummaryJson { get; set; }

        public DateTime? LastStatusChangedAt { get; private set; }

        public long? LastStatusChangedByUserId { get; private set; }

        public DateTime? AcknowledgedAt { get; private set; }

        public DateTime? ResolvedAt { get; private set; }

        public DateTime? DismissedAt { get; private set; }

        public AlertRule Rule { get; set; }

        public ActivityEvent TriggeringActivityEvent { get; set; }

        public MonitoredServer Server { get; set; }

        public MonitoredDatabase Database { get; set; }

        public MonitoredTable Table { get; set; }

        public ICollection<IncidentNote> Notes { get; set; }

        public ICollection<AlertStatusHistory> StatusHistoryEntries { get; set; }

        protected SecurityAlert()
        {
            Notes = new List<IncidentNote>();
            StatusHistoryEntries = new List<AlertStatusHistory>();
        }

        public SecurityAlert(
            int tenantId,
            Guid ruleId,
            string title,
            string summary,
            ActivitySeverity severity,
            DateTime triggeredAt,
            DateTime eventTimeStart,
            DateTime eventTimeEnd,
            int relatedEventCount)
            : this()
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            RuleId = ruleId;
            Title = title.Trim();
            Summary = summary.IsNullOrWhiteSpace() ? null : summary.Trim();
            Severity = severity;
            TriggeredAt = triggeredAt;
            EventTimeStart = eventTimeStart;
            EventTimeEnd = eventTimeEnd;
            RelatedEventCount = relatedEventCount;
            Status = SecurityAlertStatus.New;
        }

        public void Acknowledge(DateTime changedAt, long? changedByUserId = null)
        {
            TransitionTo(SecurityAlertStatus.Acknowledged, changedAt, changedByUserId);
        }

        public void StartInvestigation(DateTime changedAt, long? changedByUserId = null)
        {
            TransitionTo(SecurityAlertStatus.Investigating, changedAt, changedByUserId);
        }

        public void Resolve(DateTime changedAt, long? changedByUserId = null)
        {
            TransitionTo(SecurityAlertStatus.Resolved, changedAt, changedByUserId);
        }

        public void Dismiss(DateTime changedAt, long? changedByUserId = null)
        {
            TransitionTo(SecurityAlertStatus.Dismissed, changedAt, changedByUserId);
        }

        private void TransitionTo(SecurityAlertStatus status, DateTime changedAt, long? changedByUserId = null)
        {
            if (status == Status)
            {
                return;
            }

            if (!CanTransitionTo(status))
            {
                throw new InvalidOperationException($"Cannot transition security alert from {Status} to {status}.");
            }

            Status = status;
            LastStatusChangedAt = changedAt;
            LastStatusChangedByUserId = changedByUserId;

            if (status == SecurityAlertStatus.Acknowledged && !AcknowledgedAt.HasValue)
            {
                AcknowledgedAt = changedAt;
            }

            if (status == SecurityAlertStatus.Resolved)
            {
                ResolvedAt = changedAt;
            }

            if (status == SecurityAlertStatus.Dismissed)
            {
                DismissedAt = changedAt;
            }
        }

        private bool CanTransitionTo(SecurityAlertStatus status)
        {
            switch (Status)
            {
                case SecurityAlertStatus.New:
                    return status == SecurityAlertStatus.Acknowledged ||
                           status == SecurityAlertStatus.Investigating ||
                           status == SecurityAlertStatus.Resolved ||
                           status == SecurityAlertStatus.Dismissed;

                case SecurityAlertStatus.Acknowledged:
                    return status == SecurityAlertStatus.Investigating ||
                           status == SecurityAlertStatus.Resolved ||
                           status == SecurityAlertStatus.Dismissed;

                case SecurityAlertStatus.Investigating:
                    return status == SecurityAlertStatus.Resolved ||
                           status == SecurityAlertStatus.Dismissed;

                case SecurityAlertStatus.Resolved:
                case SecurityAlertStatus.Dismissed:
                    return false;

                default:
                    return false;
            }
        }
    }
}
