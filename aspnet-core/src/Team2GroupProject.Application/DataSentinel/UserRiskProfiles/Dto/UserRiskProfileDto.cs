using System;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class UserRiskProfileDto
    {
        public Guid Id { get; set; }
        public string ActorUser { get; set; }
        public string ActorIp { get; set; }
        public int RiskScore { get; set; }
        public UserRiskLevel RiskLevel { get; set; }
        public UserProfileStatus Status { get; set; }
        public int AlertCount { get; set; }
        public int FailedLoginCount { get; set; }
        public int PrivilegedActionCount { get; set; }
        public int HighSeverityAlertCount { get; set; }
        public int OutOfHoursEventCount { get; set; }
        public int TotalEventCount { get; set; }
        public DateTime? LastActivityAt { get; set; }
        public DateTime LastEvaluatedAt { get; set; }
    }
}
