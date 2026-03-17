using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    public interface IUserRiskProfileRepository : IRepository<UserRiskProfile, Guid>
    {
        /// <summary>
        /// Finds the risk profile for a specific actor within a tenant.
        /// Returns null if no profile exists yet — caller should create one.
        /// Used by the scoring engine (issue #37) on each evaluation pass.
        /// </summary>
        Task<UserRiskProfile> FindByActorAsync(int tenantId, string actorUser);

        /// <summary>
        /// Returns the top N actors ranked by RiskScore descending.
        /// Used by the dashboard top-risky-users panel (issue #48).
        /// </summary>
        Task<List<UserRiskProfile>> GetTopRiskyAsync(int tenantId, int count);

        /// <summary>
        /// Returns profiles whose LastEvaluatedAt is older than the given threshold.
        /// Allows the scoring engine to identify stale profiles for re-evaluation.
        /// </summary>
        Task<List<UserRiskProfile>> GetStaleProfilesAsync(int tenantId, DateTime evaluatedBefore);
    }
}
