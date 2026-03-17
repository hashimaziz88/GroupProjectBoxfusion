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
    public class SecurityAlertRepository : Team2GroupProjectRepositoryBase<SecurityAlert, Guid>, ISecurityAlertRepository
    {
        public SecurityAlertRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<SecurityAlert> GetWithContextAsync(Guid id)
        {
            return await GetAll()
                .Include(x => x.Rule)
                .Include(x => x.TriggeringActivityEvent)
                .Include(x => x.Server)
                .Include(x => x.Database)
                .Include(x => x.Table)
                .Include(x => x.Notes)
                .Include(x => x.StatusHistoryEntries)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<SecurityAlert>> GetOpenAlertsAsync(int tenantId)
        {
            return await GetAll()
                .Where(x =>
                    x.TenantId == tenantId &&
                    x.Status != SecurityAlertStatus.Resolved &&
                    x.Status != SecurityAlertStatus.Dismissed)
                .OrderByDescending(x => x.TriggeredAt)
                .ToListAsync();
        }
    }
}
