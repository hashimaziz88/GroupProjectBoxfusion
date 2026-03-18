using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IIncidentNoteAppService : IApplicationService
    {
        Task<IncidentNoteDto> CreateAsync(CreateIncidentNoteInput input);

        Task<List<IncidentNoteDto>> GetByAlertAsync(Guid alertId);
    }
}
