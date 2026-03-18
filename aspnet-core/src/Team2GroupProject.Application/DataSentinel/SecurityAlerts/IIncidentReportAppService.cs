using System;
using System.Threading.Tasks;
using Abp.Application.Services;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IIncidentReportAppService : IApplicationService
    {
        Task<byte[]> GenerateReportAsync(Guid alertId);
    }
}
