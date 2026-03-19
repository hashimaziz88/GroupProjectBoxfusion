using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.Dashboards.Dto;

namespace Team2GroupProject.DataSentinel.Dashboards
{
    public interface IDashboardsAppService : IApplicationService
    {
        Task<DashboardSummaryDto> GetSummaryAsync(DashboardWindowInput input);

        Task<DashboardActivityTrendsDto> GetActivityTrendsAsync(DashboardTrendInput input);

        Task<DashboardSeverityBreakdownDto> GetAlertsBySeverityAsync(DashboardWindowInput input);

        Task<DashboardAnomalyTimelineDto> GetAnomalyTimelineAsync(DashboardTrendInput input);

        Task<DashboardTopRiskDto> GetTopRiskyUsersAndEntitiesAsync(
            GetTopRiskyUsersAndEntitiesInput input);
    }
}
