using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public interface IMonitoredTableRepository : IRepository<MonitoredTable, Guid>
    {
        Task<IReadOnlyList<MonitoredTable>> GetByDatabaseIdAsync(Guid databaseId);
    }
}
