using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    public interface IMonitoringIntakeAppService : IApplicationService
    {
        Task<MonitoringIntakeResultDto> GenerateDemoDataAsync(GenerateDemoActivityInput input);

        Task<MonitoringIntakeResultDto> ImportActivityEventsAsync(ImportActivityEventsInput input);

        Task<ListResultDto<MonitoredServerLookupDto>> GetMonitoredServersAsync();

        Task<ListResultDto<MonitoredDatabaseLookupDto>> GetMonitoredDatabasesAsync();
    }
}
