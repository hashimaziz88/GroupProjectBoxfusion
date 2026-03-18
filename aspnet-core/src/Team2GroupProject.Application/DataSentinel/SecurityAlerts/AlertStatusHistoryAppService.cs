using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
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

            return entries.Select(MapToDto).ToList();
        }

        private static AlertStatusHistoryDto MapToDto(AlertStatusHistory entry)
        {
            return new AlertStatusHistoryDto
            {
                Id = entry.Id,
                AlertId = entry.AlertId,
                FromStatus = entry.FromStatus,
                ToStatus = entry.ToStatus,
                Comment = entry.Comment,
                CreationTime = entry.CreationTime,
                CreatorUserId = entry.CreatorUserId
            };
        }
    }
}
