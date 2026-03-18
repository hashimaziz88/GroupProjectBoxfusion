using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.ActivityEvents.Dto;

namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    public interface IActivityEventAppService : IApplicationService
    {
        /// <summary>
        /// Imports a batch of normalized activity events for the active tenant.
        /// Valid records are persisted and invalid records are reported back with item indexes.
        /// </summary>
        Task<ActivityEventIngestionResultDto> ImportBatchAsync(IngestActivityEventsInput input);

        /// <summary>
        /// Backwards-compatible alias for <see cref="ImportBatchAsync"/>.
        /// </summary>
        Task<ActivityEventIngestionResultDto> IngestAsync(IngestActivityEventsInput input);

        /// <summary>
        /// Imports a batch of ABP audit log entries by mapping them to normalized activity events.
        /// </summary>
        Task<ActivityEventIngestionResultDto> IngestAbpAuditLogsAsync(IngestAbpAuditLogsInput input);

        /// <summary>
        /// Generates a deterministic batch of simulated ABP audit logs and imports them as activity events.
        /// </summary>
        Task<ActivityEventIngestionResultDto> SeedSimulatedAbpAuditLogsAsync(SeedSimulatedAbpAuditLogsInput input);

        Task<PagedResultDto<ActivityEventDto>> GetPagedAsync(GetActivityEventsInput input);

        Task<ActivityEventSummaryDto> GetSummaryAsync();

        Task<ActivityEventFilterOptionsDto> GetFilterOptionsAsync();
    }
}
