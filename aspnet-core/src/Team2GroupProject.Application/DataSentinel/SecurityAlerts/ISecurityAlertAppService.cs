using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    public interface ISecurityAlertAppService : IApplicationService
    {
        Task<PagedResultDto<SecurityAlertDto>> GetPagedAsync(GetSecurityAlertsInput input);

        Task<SecurityAlertDetailDto> GetByIdAsync(Guid id);

        Task UpdateStatusAsync(UpdateAlertStatusInput input);

        Task BulkUpdateStatusAsync(BulkUpdateAlertStatusInput input);

        Task<SecurityAlertFilterOptionsDto> GetFilterOptionsAsync();
    }
}
