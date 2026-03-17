using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    public interface IActivityEventRepository : IRepository<ActivityEvent, Guid>
    {
        /// <summary>
        /// Returns the most recent N events for a given database, ordered by EventTime descending.
        /// Used by the related-event drill-down panel (issue #31).
        /// </summary>
        Task<List<ActivityEvent>> GetRecentByDatabaseAsync(Guid databaseId, int count);

        /// <summary>
        /// Returns all failed login events for a given actor within a time window.
        /// Used by the repeated-failure detection rule (issue #42).
        /// </summary>
        Task<List<ActivityEvent>> GetFailedLoginsByActorAsync(
            int tenantId,
            string actorUser,
            DateTime windowStart,
            DateTime windowEnd);

        /// <summary>
        /// Returns event counts grouped by EventType within a time window.
        /// Used by anomaly detection threshold rules (issue #39).
        /// </summary>
        Task<int> CountByEventTypeAsync(
            int tenantId,
            ActivityEventType eventType,
            DateTime windowStart,
            DateTime windowEnd,
            string actorUser = null,
            Guid? databaseId = null);
    }
}
