using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IAlertStatusHistoryRepository : IRepository<AlertStatusHistory, Guid>
    {
        Task<List<AlertStatusHistory>> GetByAlertAsync(Guid alertId);
    }
}
