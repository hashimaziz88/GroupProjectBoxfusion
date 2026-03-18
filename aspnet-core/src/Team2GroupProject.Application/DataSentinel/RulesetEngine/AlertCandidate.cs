using System;

namespace Team2GroupProject.DataSentinel.RulesetEngine
{
    internal class AlertCandidate
    {
        public Guid? TriggeringEventId { get; set; }

        public string Title { get; set; }

        public string Summary { get; set; }

        public string PrimaryActorUser { get; set; }

        public string PrimaryActorIp { get; set; }

        public DateTime EventTimeStart { get; set; }

        public DateTime EventTimeEnd { get; set; }

        public int RelatedEventCount { get; set; }

        public Guid? DatabaseId { get; set; }

        public Guid? ServerId { get; set; }

        public string EvidenceSummaryJson { get; set; }
    }
}
