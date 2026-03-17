using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class AlertStatusHistoryRepository : Team2GroupProjectRepositoryBase<AlertStatusHistory, Guid>, IAlertStatusHistoryRepository
    {
        public AlertStatusHistoryRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<List<AlertStatusHistory>> GetByAlertAsync(Guid alertId)
        {
            return await GetAll()
                .Where(x => x.AlertId == alertId)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();
        }
    }
}
