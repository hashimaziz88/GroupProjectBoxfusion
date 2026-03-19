using System;
using System.Collections.Generic;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class DashboardTopRiskDto
    {
        public DateTime WindowStartUtc { get; set; }

        public DateTime WindowEndUtc { get; set; }

        public List<DashboardRiskyUserDto> Users { get; set; } = new();

        public List<DashboardRiskEntityDto> Databases { get; set; } = new();

        public List<DashboardRiskEntityDto> Tables { get; set; } = new();
    }

    public class DashboardRiskyUserDto
    {
        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        public int RiskScore { get; set; }

        public UserRiskLevel RiskLevel { get; set; }

        public int AlertCount { get; set; }

        public int FailedLoginCount { get; set; }

        public int PrivilegedActionCount { get; set; }

        public int HighSeverityAlertCount { get; set; }

        public int OutOfHoursEventCount { get; set; }

        public DateTime LastEvaluatedAt { get; set; }
    }

    public class DashboardRiskEntityDto
    {
        public Guid? EntityId { get; set; }

        public string Name { get; set; }

        public int AlertCount { get; set; }

        public int HighSeverityAlertCount { get; set; }

        public DateTime? LastAlertAtUtc { get; set; }
    }
}
