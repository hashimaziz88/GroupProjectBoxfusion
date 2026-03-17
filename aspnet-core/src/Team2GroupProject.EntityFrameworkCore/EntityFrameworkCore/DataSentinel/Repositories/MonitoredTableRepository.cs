using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class MonitoredTableRepository : Team2GroupProjectRepositoryBase<MonitoredTable, Guid>, IMonitoredTableRepository
    {
        public MonitoredTableRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<IReadOnlyList<MonitoredTable>> GetByDatabaseIdAsync(Guid databaseId)
        {
            return await GetAll()
                .Where(x => x.DatabaseId == databaseId)
                .OrderBy(x => x.SchemaName)
                .ThenBy(x => x.Name)
                .ToListAsync();
        }
    }
}
