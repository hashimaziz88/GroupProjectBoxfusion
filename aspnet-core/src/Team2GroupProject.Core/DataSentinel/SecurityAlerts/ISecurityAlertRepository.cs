using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface ISecurityAlertRepository : IRepository<SecurityAlert, Guid>
    {
        Task<SecurityAlert> GetWithContextAsync(Guid id);

        Task<List<SecurityAlert>> GetOpenAlertsAsync(int tenantId);
    }
}
