using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Domain.Repositories;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IIncidentNoteRepository : IRepository<IncidentNote, Guid>
    {
        Task<List<IncidentNote>> GetByAlertAsync(Guid alertId);

        Task<List<IncidentNote>> GetByAlertAsync(int tenantId, Guid alertId);
    }
}
