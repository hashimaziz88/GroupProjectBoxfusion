using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.AlertRules
{
    public interface IAlertRuleRepository : IRepository<AlertRule, Guid>
    {
        /// <summary>
        /// Returns all enabled rules for a tenant.
        /// Called by the anomaly detection engine at evaluation time (issue #37).
        /// </summary>
        Task<List<AlertRule>> GetAllEnabledAsync(int tenantId);

        /// <summary>
        /// Returns all rules of a specific type for a tenant.
        /// Used to load only the relevant evaluator's rules without fetching the full rule set.
        /// </summary>
        Task<List<AlertRule>> GetEnabledByTypeAsync(int tenantId, AlertRuleType ruleType);
    }
}
