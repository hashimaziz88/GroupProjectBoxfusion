using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    /// <summary>
    /// Aggregated risk profile for a database actor (user/login).
    /// Maintained by the risk scoring engine so that dashboard queries are fast
    /// and do not require expensive on-the-fly aggregation over event history.
    /// One profile exists per (TenantId, ActorUser) pair.
    /// </summary>
    public class UserRiskProfile : FullAuditedEntity<Guid>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        /// <summary>The database user or login this profile tracks.</summary>
        public string ActorUser { get; set; }

        /// <summary>Most recently observed source IP for this actor. Updated on each evaluation pass.</summary>
        public string ActorIp { get; set; }

        /// <summary>
        /// Normalized risk score 0–100.
        /// Computed by the risk scoring engine from weighted activity counters.
        /// </summary>
        public int RiskScore { get; set; }

        /// <summary>
        /// Coarse risk classification derived from RiskScore.
        /// Stored as a column so the dashboard top-risky-users query can filter/sort without recomputing.
        /// </summary>
        public UserRiskLevel RiskLevel { get; set; }

        /// <summary>When the risk scoring engine last recalculated this profile.</summary>
        public DateTime LastEvaluatedAt { get; set; }

        /// <summary>Total number of security alerts that cite this actor as the primary actor.</summary>
        public int AlertCount { get; set; }

        /// <summary>Total number of failed login events attributed to this actor.</summary>
        public int FailedLoginCount { get; set; }

        /// <summary>Total number of privileged-action events attributed to this actor.</summary>
        public int PrivilegedActionCount { get; set; }

        /// <summary>Number of alerts with High or Critical severity involving this actor.</summary>
        public int HighSeverityAlertCount { get; set; }

        /// <summary>Number of events flagged as out-of-hours for this actor.</summary>
        public int OutOfHoursEventCount { get; set; }

        protected UserRiskProfile()
        {
        }

        public UserRiskProfile(int tenantId, string actorUser)
        {
            Id = Guid.NewGuid();
            TenantId = tenantId;
            ActorUser = actorUser.Trim();
            RiskScore = 0;
            RiskLevel = UserRiskLevel.None;
            LastEvaluatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Recalculates RiskScore and RiskLevel from current counters.
        /// Called by the risk scoring engine (issue #37) after updating individual counters.
        /// Weights are intentionally simple and explainable for the MVP.
        /// </summary>
        public void RecalculateRisk(DateTime evaluatedAt)
        {
            // Weighted sum — each dimension contributes a capped partial score.
            // Weights chosen to make repeated failures and high-severity alerts dominant signals.
            int score = 0;
            score += Math.Min(FailedLoginCount * 5, 30);        // up to 30 pts — login failures
            score += Math.Min(HighSeverityAlertCount * 10, 30); // up to 30 pts — high/critical alerts
            score += Math.Min(PrivilegedActionCount * 3, 20);   // up to 20 pts — privileged ops
            score += Math.Min(OutOfHoursEventCount * 2, 10);    // up to 10 pts — out-of-hours
            score += Math.Min(AlertCount * 1, 10);              // up to 10 pts — alert volume

            RiskScore = Math.Min(score, 100);
            RiskLevel = RiskScore switch
            {
                0 => UserRiskLevel.None,
                <= 25 => UserRiskLevel.Low,
                <= 50 => UserRiskLevel.Medium,
                <= 75 => UserRiskLevel.High,
                _ => UserRiskLevel.Critical
            };

            LastEvaluatedAt = evaluatedAt;
        }
    }
}
