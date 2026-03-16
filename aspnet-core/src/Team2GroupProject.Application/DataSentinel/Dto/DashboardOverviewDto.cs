using System.Collections.Generic;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class DashboardOverviewDto
    {
        public int ActiveAlertCount { get; set; }

        public int CriticalAlertCount { get; set; }

        public int InProgressAlertCount { get; set; }

        public int ResolvedTodayCount { get; set; }

        public int TotalEventCount { get; set; }

        public int FailedLoginCount { get; set; }

        public int PrivilegedActionCount { get; set; }

        public int LargeReadEventCount { get; set; }

        public int MonitoredServerCount { get; set; }

        public int MonitoredDatabaseCount { get; set; }

        public int EnabledRuleCount { get; set; }

        public List<DashboardSeverityCountDto> AlertsBySeverity { get; set; } = new List<DashboardSeverityCountDto>();

        public List<DashboardStatusCountDto> AlertsByStatus { get; set; } = new List<DashboardStatusCountDto>();

        public List<DashboardTrendPointDto> AnomalyTrend { get; set; } = new List<DashboardTrendPointDto>();

        public List<DashboardActivityPointDto> ActivitySeries { get; set; } = new List<DashboardActivityPointDto>();

        public List<DashboardRiskActorDto> TopRiskActors { get; set; } = new List<DashboardRiskActorDto>();

        public List<DashboardRecentAlertDto> RecentAlerts { get; set; } = new List<DashboardRecentAlertDto>();
    }

    public class DashboardSeverityCountDto
    {
        public AlertSeverity Severity { get; set; }

        public int Count { get; set; }
    }

    public class DashboardStatusCountDto
    {
        public SecurityAlertStatus Status { get; set; }

        public int Count { get; set; }
    }

    public class DashboardTrendPointDto
    {
        public string Label { get; set; }

        public int Count { get; set; }
    }

    public class DashboardActivityPointDto
    {
        public string Label { get; set; }

        public int Reads { get; set; }

        public int Writes { get; set; }

        public int FailedLogins { get; set; }
    }

    public class DashboardRiskActorDto
    {
        public string ActorUser { get; set; }

        public int RiskScore { get; set; }

        public int AlertCount { get; set; }

        public int EventCount { get; set; }

        public string TopIndicator { get; set; }
    }

    public class DashboardRecentAlertDto
    {
        public long Id { get; set; }

        public string Title { get; set; }

        public AlertSeverity Severity { get; set; }

        public SecurityAlertStatus Status { get; set; }

        public string ActorUser { get; set; }

        public string RuleName { get; set; }

        public string RelativeHint { get; set; }
    }
}
