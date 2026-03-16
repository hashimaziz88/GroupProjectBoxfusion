using System;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Detection
{
    public class AlertCandidate
    {
        public long RuleId { get; set; }

        public AlertSeverity Severity { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public string PrimaryActorUser { get; set; }

        public string PrimaryActorIp { get; set; }

        public DateTime EventTimeStart { get; set; }

        public DateTime EventTimeEnd { get; set; }

        public int RelatedEventCount { get; set; }

        public string TopEvidenceJson { get; set; }
    }
}
