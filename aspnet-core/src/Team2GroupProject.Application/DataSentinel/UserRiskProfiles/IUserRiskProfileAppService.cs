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
        Task<UserRiskProfileDetailDto> GetByIdAsync(Guid id);
        Task<UserRiskProfileSummaryDto> GetSummaryAsync();
        Task UpdateStatusAsync(UpdateUserRiskProfileStatusInput input);
    }
}
