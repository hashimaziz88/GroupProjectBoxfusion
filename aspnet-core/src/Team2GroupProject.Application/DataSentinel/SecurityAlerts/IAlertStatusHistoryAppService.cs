using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IAlertStatusHistoryAppService : IApplicationService
    {
        Task<List<AlertStatusHistoryDto>> GetByAlertAsync(Guid alertId);
    }
}
