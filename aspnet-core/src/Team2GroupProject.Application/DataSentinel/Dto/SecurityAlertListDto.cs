using System;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class SecurityAlertListDto
    {
        public long Id { get; set; }

        public string RuleName { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public AlertSeverity Severity { get; set; }

        public SecurityAlertStatus Status { get; set; }

        public string PrimaryActorUser { get; set; }

        public string PrimaryActorIp { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime EventTimeStart { get; set; }

        public DateTime EventTimeEnd { get; set; }

        public int RelatedEventCount { get; set; }
    }
}
