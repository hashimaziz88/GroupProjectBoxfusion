using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    public interface IAlertsAppService : IApplicationService
    {
        Task<PagedResultDto<SecurityAlertListDto>> GetPagedAlertsAsync(GetSecurityAlertsInput input);

        Task<SecurityAlertDetailDto> GetAlertDetailAsync(EntityDto<long> input);

        Task<SecurityAlertDetailDto> UpdateStatusAsync(UpdateSecurityAlertStatusInput input);

        Task<IncidentNoteDto> AddNoteAsync(CreateIncidentNoteInput input);
    }
}
