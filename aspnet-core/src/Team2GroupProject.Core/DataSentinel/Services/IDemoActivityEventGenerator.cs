using System.Collections.Generic;
using Abp.Dependency;
using Team2GroupProject.DataSentinel.Detection;

namespace Team2GroupProject.DataSentinel.Services
{
    public interface IDemoActivityEventGenerator : ITransientDependency
    {
        DemoActivityGenerationResult Generate(
            int tenantId,
            IReadOnlyCollection<MonitoredServer> servers,
            IReadOnlyCollection<MonitoredDatabase> databases,
            int eventCount,
            int seed,
            bool includeAnomalies);
    }
}
