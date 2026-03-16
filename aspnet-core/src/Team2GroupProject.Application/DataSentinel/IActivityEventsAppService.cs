using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    public interface IActivityEventsAppService : IApplicationService
    {
        Task<PagedResultDto<ActivityEventListDto>> GetPagedActivityEventsAsync(GetActivityEventsInput input);
    }
}
