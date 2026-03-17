using System;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public interface IMonitoredDatabaseRepository : IRepository<MonitoredDatabase, Guid>
    {
        Task<MonitoredDatabase> GetWithTablesAsync(Guid id);
    }
}
