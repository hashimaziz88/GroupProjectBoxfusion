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
    public class IncidentNoteRepository : Team2GroupProjectRepositoryBase<IncidentNote, Guid>, IIncidentNoteRepository
    {
        public IncidentNoteRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<List<IncidentNote>> GetByAlertAsync(Guid alertId)
        {
            return await GetAll()
                .Where(x => x.AlertId == alertId)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();
        }

        public async Task<List<IncidentNote>> GetByAlertAsync(int tenantId, Guid alertId)
        {
            return await GetAll()
                .Where(x => x.TenantId == tenantId && x.AlertId == alertId)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();
        }
    }
}
