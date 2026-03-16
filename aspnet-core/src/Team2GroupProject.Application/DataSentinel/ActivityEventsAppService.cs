using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Dashboard)]
    public class ActivityEventsAppService : Team2GroupProjectAppServiceBase, IActivityEventsAppService
    {
        private readonly IRepository<ActivityEvent, long> _activityEventRepository;

        public ActivityEventsAppService(IRepository<ActivityEvent, long> activityEventRepository)
        {
            _activityEventRepository = activityEventRepository;
        }

        public async Task<PagedResultDto<ActivityEventListDto>> GetPagedActivityEventsAsync(GetActivityEventsInput input)
        {
            input ??= new GetActivityEventsInput();
            var tenantId = GetTenantId();
            var keyword = input.Keyword?.Trim();

            var query = _activityEventRepository.GetAll()
                .Where(activityEvent => activityEvent.TenantId == tenantId)
                .WhereIf(!string.IsNullOrWhiteSpace(keyword), activityEvent =>
                    activityEvent.ActorUser.Contains(keyword) ||
                    activityEvent.ActorIp.Contains(keyword) ||
                    activityEvent.ObjectName.Contains(keyword) ||
                    activityEvent.Operation.Contains(keyword) ||
                    activityEvent.QuerySignature.Contains(keyword))
                .WhereIf(input.ServerId.HasValue, activityEvent => activityEvent.ServerId == input.ServerId.Value)
                .WhereIf(input.DatabaseId.HasValue, activityEvent => activityEvent.DatabaseId == input.DatabaseId.Value)
                .WhereIf(input.EventType.HasValue, activityEvent => activityEvent.EventType == input.EventType.Value)
                .WhereIf(input.Severity.HasValue, activityEvent => activityEvent.Severity == input.Severity.Value)
                .WhereIf(input.IsSuccessful.HasValue, activityEvent => activityEvent.IsSuccessful == input.IsSuccessful.Value)
                .WhereIf(input.IsOutOfHours.HasValue, activityEvent => activityEvent.IsOutOfHours == input.IsOutOfHours.Value)
                .WhereIf(input.DateFromUtc.HasValue, activityEvent => activityEvent.EventTime >= input.DateFromUtc.Value)
                .WhereIf(input.DateToUtc.HasValue, activityEvent => activityEvent.EventTime <= input.DateToUtc.Value);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(activityEvent => activityEvent.EventTime)
                .PageBy(input)
                .Select(activityEvent => new ActivityEventListDto
                {
                    Id = activityEvent.Id,
                    ServerName = activityEvent.Server.Name,
                    DatabaseName = activityEvent.Database.Name,
                    EventTime = activityEvent.EventTime,
                    EventType = activityEvent.EventType,
                    ActorUser = activityEvent.ActorUser,
                    ActorIp = activityEvent.ActorIp,
                    ObjectName = activityEvent.ObjectName,
                    Operation = activityEvent.Operation,
                    RowsAffected = activityEvent.RowsAffected,
                    DurationMs = activityEvent.DurationMs,
                    IsSuccessful = activityEvent.IsSuccessful,
                    IsOutOfHours = activityEvent.IsOutOfHours,
                    IsPrivilegedAction = activityEvent.IsPrivilegedAction,
                    Severity = activityEvent.Severity,
                    QuerySignature = activityEvent.QuerySignature,
                    FailureReason = activityEvent.FailureReason
                })
                .ToListAsync();

            return new PagedResultDto<ActivityEventListDto>(totalCount, items);
        }

        private int GetTenantId()
        {
            return AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel activity events require an active tenant context.");
        }
    }
}
