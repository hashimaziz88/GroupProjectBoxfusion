using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    public interface IAlertRulesAppService : IApplicationService
    {
        Task<ListResultDto<AlertRuleListItemDto>> GetRulesAsync();

        Task<AlertRuleListItemDto> UpdateRuleAsync(UpdateAlertRuleInput input);
    }
}
