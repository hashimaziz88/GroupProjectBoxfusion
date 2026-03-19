using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_View)]
    public class AlertStatusHistoryAppService : Team2GroupProjectAppServiceBase, IAlertStatusHistoryAppService
    {
        private readonly IAlertStatusHistoryRepository _alertStatusHistoryRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;

        public AlertStatusHistoryAppService(
            IAlertStatusHistoryRepository alertStatusHistoryRepository,
            ISecurityAlertRepository securityAlertRepository)
        {
            _alertStatusHistoryRepository = alertStatusHistoryRepository;
            _securityAlertRepository = securityAlertRepository;
        }

        public async Task<List<AlertStatusHistoryDto>> GetByAlertAsync(Guid alertId)
        {
            var tenantId = AbpSession.GetTenantId();

            var alertExists = await _securityAlertRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId && x.Id == alertId);

            if (!alertExists)
            {
                throw new UserFriendlyException("Security alert not found.");
            }

            var entries = await _alertStatusHistoryRepository.GetAll()
                .Where(x => x.AlertId == alertId)
                .OrderByDescending(x => x.CreationTime)
                .ToListAsync();

            var userNames = await ResolveUserNamesAsync(entries.Select(x => x.CreatorUserId));
            return entries.Select(x => MapToDto(x, userNames)).ToList();
        }

        private async Task<Dictionary<long, string>> ResolveUserNamesAsync(IEnumerable<long?> userIds)
        {
            var resolvedIds = userIds
                .Where(x => x.HasValue)
                .Select(x => x.Value)
                .Distinct()
                .ToList();

            if (resolvedIds.Count == 0)
            {
                return new Dictionary<long, string>();
            }

            var users = await UserManager.Users
                .Where(x => resolvedIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.UserName,
                    x.Name,
                    x.Surname
                })
                .ToListAsync();

            return users.ToDictionary(
                x => x.Id,
                x =>
                {
                    var fullName = $"{x.Name} {x.Surname}".Trim();
                    return fullName.IsNullOrWhiteSpace() ? x.UserName : fullName;
                });
        }

        private static AlertStatusHistoryDto MapToDto(
            AlertStatusHistory entry,
            IReadOnlyDictionary<long, string> userNames)
        {
            return new AlertStatusHistoryDto
            {
                Id = entry.Id,
                AlertId = entry.AlertId,
                FromStatus = entry.FromStatus,
                ToStatus = entry.ToStatus,
                Comment = entry.Comment,
                CreationTime = entry.CreationTime,
                CreatorUserId = entry.CreatorUserId,
                CreatorUserDisplayName = entry.CreatorUserId.HasValue &&
                    userNames.TryGetValue(entry.CreatorUserId.Value, out var name)
                    ? name
                    : null
            };
        }
    }
}
