using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    public interface IDashboardsAppService : IApplicationService
    {
        Task<DashboardOverviewDto> GetOverviewAsync(GetDashboardOverviewInput input);
    }
}
