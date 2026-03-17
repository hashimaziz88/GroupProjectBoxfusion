using System;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class MonitoredDatabaseRepository : Team2GroupProjectRepositoryBase<MonitoredDatabase, Guid>, IMonitoredDatabaseRepository
    {
        public MonitoredDatabaseRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<MonitoredDatabase> GetWithTablesAsync(Guid id)
        {
            return await GetAllIncluding(x => x.Tables)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
