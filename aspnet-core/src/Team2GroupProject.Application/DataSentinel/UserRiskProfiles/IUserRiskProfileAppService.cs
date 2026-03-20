using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.UserRiskProfiles.Dto;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    public interface IUserRiskProfileAppService : IApplicationService
    {
        Task<PagedResultDto<UserRiskProfileDto>> GetPagedAsync(GetUserRiskProfilesInput input);
        Task<UserRiskProfileDto> GetByIdAsync(Guid id);
        Task<UserRiskProfileSummaryDto> GetSummaryAsync();
    }
}
