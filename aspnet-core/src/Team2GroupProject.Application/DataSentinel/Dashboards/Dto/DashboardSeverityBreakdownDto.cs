using System;
using System.Collections.Generic;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class DashboardSeverityBreakdownDto
    {
        public DateTime WindowStartUtc { get; set; }

        public DateTime WindowEndUtc { get; set; }

        public List<DashboardSeverityPointDto> Items { get; set; } = new();
    }

    public class DashboardSeverityPointDto
    {
        public ActivitySeverity Severity { get; set; }

        public int Count { get; set; }
    }
}
