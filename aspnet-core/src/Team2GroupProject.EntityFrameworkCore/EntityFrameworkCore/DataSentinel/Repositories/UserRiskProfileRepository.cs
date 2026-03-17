using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class UserRiskProfileRepository : Team2GroupProjectRepositoryBase<UserRiskProfile, Guid>, IUserRiskProfileRepository
    {
        public UserRiskProfileRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<UserRiskProfile> FindByActorAsync(int tenantId, string actorUser)
        {
            return await GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ActorUser == actorUser);
        }

        public async Task<List<UserRiskProfile>> GetTopRiskyAsync(int tenantId, int count)
        {
            return await GetAll()
                .Where(x => x.TenantId == tenantId && x.RiskScore > 0)
                .OrderByDescending(x => x.RiskScore)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<UserRiskProfile>> GetStaleProfilesAsync(int tenantId, DateTime evaluatedBefore)
        {
            return await GetAll()
                .Where(x => x.TenantId == tenantId && x.LastEvaluatedAt < evaluatedBefore)
                .OrderBy(x => x.LastEvaluatedAt)
                .ToListAsync();
        }
    }
}
