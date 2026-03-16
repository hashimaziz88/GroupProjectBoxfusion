using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class MonitoringIntakeResultDto
    {
        public int CreatedEventCount { get; set; }

        public int CreatedAlertCount { get; set; }

        public IReadOnlyCollection<long> CreatedAlertIds { get; set; }

        public IReadOnlyCollection<string> ScenarioNames { get; set; }
    }
}
