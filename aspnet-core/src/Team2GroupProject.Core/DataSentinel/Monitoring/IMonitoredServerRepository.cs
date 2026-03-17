using System;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public interface IMonitoredServerRepository : IRepository<MonitoredServer, Guid>
    {
        Task<MonitoredServer> GetWithHierarchyAsync(Guid id);
    }
}
