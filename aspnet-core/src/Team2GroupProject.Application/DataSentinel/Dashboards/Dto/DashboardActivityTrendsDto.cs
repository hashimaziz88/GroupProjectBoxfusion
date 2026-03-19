using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class DashboardActivityTrendsDto
    {
        public DateTime WindowStartUtc { get; set; }

        public DateTime WindowEndUtc { get; set; }

        public int BucketHours { get; set; }

        public List<DashboardTrendPointDto> Reads { get; set; } = new();

        public List<DashboardTrendPointDto> Writes { get; set; } = new();

        public List<DashboardTrendPointDto> FailedAccess { get; set; } = new();

        public List<DashboardTrendPointDto> Alerts { get; set; } = new();
    }

    public class DashboardTrendPointDto
    {
        public DateTime BucketStartUtc { get; set; }

        public int Count { get; set; }
    }
}
