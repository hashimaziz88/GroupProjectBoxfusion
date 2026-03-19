using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class DashboardAnomalyTimelineDto
    {
        public DateTime WindowStartUtc { get; set; }

        public DateTime WindowEndUtc { get; set; }

        public int BucketHours { get; set; }

        public List<DashboardAnomalyTimelinePointDto> Items { get; set; } = new();
    }

    public class DashboardAnomalyTimelinePointDto
    {
        public DateTime BucketStartUtc { get; set; }

        public int SuspiciousEventCount { get; set; }

        public int AlertCount { get; set; }

        public int HighSeverityAlertCount { get; set; }
    }
}
