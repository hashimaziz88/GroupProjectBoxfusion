using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Monitoring.Dto;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    public interface IMonitoringInfrastructureAppService : IApplicationService
    {
        Task<ListResultDto<MonitoredServerDto>> GetMonitoredServersAsync();

        Task<ListResultDto<MonitoredDatabaseDto>> GetMonitoredDatabasesAsync(GetMonitoredDatabasesInput input);

        Task<ListResultDto<MonitoredTableDto>> GetMonitoredTablesAsync(GetMonitoredTablesInput input);

        Task<MonitoredServerDto> CreateMonitoredServerAsync(CreateMonitoredServerInput input);

        Task<MonitoredDatabaseDto> CreateMonitoredDatabaseAsync(CreateMonitoredDatabaseInput input);

        Task<MonitoredTableDto> CreateMonitoredTableAsync(CreateMonitoredTableInput input);

        Task<BootstrapMonitoringDemoResultDto> BootstrapDemoAsync(BootstrapMonitoringDemoInput input);
    }
}
