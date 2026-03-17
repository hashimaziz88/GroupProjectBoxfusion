using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.EntityFrameworkCore.Repositories;

namespace Team2GroupProject.EntityFrameworkCore.DataSentinel.Repositories
{
    public class AlertRuleRepository : Team2GroupProjectRepositoryBase<AlertRule, Guid>, IAlertRuleRepository
    {
        public AlertRuleRepository(IDbContextProvider<Team2GroupProjectDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }

        public async Task<List<AlertRule>> GetAllEnabledAsync(int tenantId)
        {
            return await GetAll()
                .Where(x => x.TenantId == tenantId && x.IsEnabled)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<List<AlertRule>> GetEnabledByTypeAsync(int tenantId, AlertRuleType ruleType)
        {
            return await GetAll()
                .Where(x => x.TenantId == tenantId && x.IsEnabled && x.RuleType == ruleType)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }
    }
}
