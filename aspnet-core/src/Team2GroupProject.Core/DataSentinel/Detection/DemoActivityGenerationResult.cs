using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.Detection
{
    public class DemoActivityGenerationResult
    {
        public IReadOnlyCollection<ActivityEvent> Events { get; set; }

        public IReadOnlyCollection<string> ScenarioNames { get; set; }
    }
}
