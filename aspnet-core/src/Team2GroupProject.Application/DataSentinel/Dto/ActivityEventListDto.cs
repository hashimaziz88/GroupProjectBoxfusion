using System;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class ActivityEventListDto
    {
        public long Id { get; set; }

        public string ServerName { get; set; }

        public string DatabaseName { get; set; }

        public DateTime EventTime { get; set; }

        public ActivityEventType EventType { get; set; }

        public string ActorUser { get; set; }

        public string ActorIp { get; set; }

        public string ObjectName { get; set; }

        public string Operation { get; set; }

        public int? RowsAffected { get; set; }

        public int DurationMs { get; set; }

        public bool IsSuccessful { get; set; }

        public bool IsOutOfHours { get; set; }

        public bool IsPrivilegedAction { get; set; }

        public AlertSeverity Severity { get; set; }

        public string QuerySignature { get; set; }

        public string FailureReason { get; set; }
    }
}
