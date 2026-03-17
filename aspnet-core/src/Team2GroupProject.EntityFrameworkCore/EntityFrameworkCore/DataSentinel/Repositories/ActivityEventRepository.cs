using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class ActivityEventRepository : Team2GroupProjectRepositoryBase<ActivityEvent, Guid>, IActivityEventRepository
    {
        public ActivityEventRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<List<ActivityEvent>> GetRecentByDatabaseAsync(Guid databaseId, int count)
        {
            return await GetAll()
                .Where(x => x.DatabaseId == databaseId)
                .OrderByDescending(x => x.EventTime)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<ActivityEvent>> GetFailedLoginsByActorAsync(
            int tenantId,
            string actorUser,
            DateTime windowStart,
            DateTime windowEnd)
        {
            return await GetAll()
                .Where(x =>
                    x.TenantId == tenantId &&
                    x.EventType == ActivityEventType.Login &&
                    !x.IsSuccess &&
                    x.ActorUser == actorUser &&
                    x.EventTime >= windowStart &&
                    x.EventTime <= windowEnd)
                .OrderByDescending(x => x.EventTime)
                .ToListAsync();
        }

        public async Task<int> CountByEventTypeAsync(
            int tenantId,
            ActivityEventType eventType,
            DateTime windowStart,
            DateTime windowEnd,
            string actorUser = null,
            Guid? databaseId = null)
        {
            var query = GetAll()
                .Where(x =>
                    x.TenantId == tenantId &&
                    x.EventType == eventType &&
                    x.EventTime >= windowStart &&
                    x.EventTime <= windowEnd);

            if (!string.IsNullOrWhiteSpace(actorUser))
                query = query.Where(x => x.ActorUser == actorUser);

            if (databaseId.HasValue)
                query = query.Where(x => x.DatabaseId == databaseId.Value);

            return await query.CountAsync();
        }
    }
}
