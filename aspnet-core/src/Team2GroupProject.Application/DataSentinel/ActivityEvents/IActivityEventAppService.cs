using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.DataSentinel.ActivityEvents.Dto;

namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    public interface IActivityEventAppService : IApplicationService
    {
        Task<ActivityEventIngestionResultDto> IngestAsync(IngestActivityEventsInput input);

        Task<ActivityEventIngestionResultDto> IngestAbpAuditLogsAsync(IngestAbpAuditLogsInput input);

        Task<ActivityEventIngestionResultDto> SeedSimulatedAbpAuditLogsAsync(SeedSimulatedAbpAuditLogsInput input);
    }
}
