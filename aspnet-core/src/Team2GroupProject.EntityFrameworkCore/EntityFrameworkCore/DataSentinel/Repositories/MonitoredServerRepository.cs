using System;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class MonitoredServerRepository : Team2GroupProjectRepositoryBase<MonitoredServer, Guid>, IMonitoredServerRepository
    {
        public MonitoredServerRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<MonitoredServer> GetWithHierarchyAsync(Guid id)
        {
            return await GetAllIncluding(x => x.Databases)
                .Include(x => x.Databases)
                    .ThenInclude(x => x.Tables)
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
