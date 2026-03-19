using System;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class RecentActivityItemDto
    {
        public Guid Id { get; set; }
        public DateTime EventTime { get; set; }
        public string Operation { get; set; }
        public string ObjectName { get; set; }
        public ActivitySeverity Severity { get; set; }
        public bool IsSuccess { get; set; }
        public Guid? DatabaseId { get; set; }
    }
}
