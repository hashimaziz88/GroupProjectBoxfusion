using System;
using System.Threading.Tasks;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface IIncidentReportAppService
    {
        Task<byte[]> GenerateReportAsync(Guid alertId);
    }
}
