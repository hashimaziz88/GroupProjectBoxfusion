using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Dto;

namespace Team2GroupProject.DataSentinel
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Rules_View)]
    public class AlertRulesAppService : Team2GroupProjectAppServiceBase, IAlertRulesAppService
    {
        private readonly IRepository<AlertRule, long> _alertRuleRepository;
        private readonly IRepository<SecurityAlert, long> _securityAlertRepository;

        public AlertRulesAppService(
            IRepository<AlertRule, long> alertRuleRepository,
            IRepository<SecurityAlert, long> securityAlertRepository)
        {
            _alertRuleRepository = alertRuleRepository;
            _securityAlertRepository = securityAlertRepository;
        }

        public async Task<ListResultDto<AlertRuleListItemDto>> GetRulesAsync()
        {
            var tenantId = GetTenantId();
            var rules = await _alertRuleRepository.GetAll()
                .Where(rule => rule.TenantId == tenantId)
                .OrderByDescending(rule => rule.IsEnabled)
                .ThenBy(rule => rule.Name)
                .Select(rule => new AlertRuleListItemDto
                {
                    Id = rule.Id,
                    Name = rule.Name,
                    Description = rule.Description,
                    IsEnabled = rule.IsEnabled,
                    RuleType = rule.RuleType,
                    EventType = rule.EventType,
                    WindowMinutes = rule.WindowMinutes,
                    ThresholdCount = rule.ThresholdCount,
                    GroupByField = rule.GroupByField,
                    Severity = rule.Severity
                })
                .ToListAsync();

            var alertStats = await _securityAlertRepository.GetAll()
                .Where(alert => alert.TenantId == tenantId)
                .GroupBy(alert => alert.RuleId)
                .Select(group => new
                {
                    RuleId = group.Key,
                    Count = group.Count(),
                    LastTriggeredAt = group.Max(alert => alert.CreationTime)
                })
                .ToListAsync();

            foreach (var rule in rules)
            {
                var stats = alertStats.FirstOrDefault(item => item.RuleId == rule.Id);
                if (stats == null)
                {
                    continue;
                }

                rule.TriggeredAlertCount = stats.Count;
                rule.LastTriggeredAt = stats.LastTriggeredAt;
            }

            return new ListResultDto<AlertRuleListItemDto>(rules);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Rules_Manage)]
        public async Task<AlertRuleListItemDto> UpdateRuleAsync(UpdateAlertRuleInput input)
        {
            var tenantId = GetTenantId();
            var rule = await _alertRuleRepository.GetAll()
                .FirstOrDefaultAsync(alertRule => alertRule.TenantId == tenantId && alertRule.Id == input.Id);

            if (rule == null)
            {
                throw new UserFriendlyException($"Alert rule {input.Id} was not found.");
            }

            rule.Name = input.Name.Trim();
            rule.Description = input.Description?.Trim();
            rule.IsEnabled = input.IsEnabled;
            rule.RuleType = input.RuleType;
            rule.EventType = input.EventType;
            rule.WindowMinutes = input.WindowMinutes;
            rule.ThresholdCount = input.ThresholdCount;
            rule.GroupByField = input.GroupByField?.Trim();
            rule.Severity = input.Severity;

            await _alertRuleRepository.UpdateAsync(rule);
            await CurrentUnitOfWork.SaveChangesAsync();

            var alertStats = await _securityAlertRepository.GetAll()
                .Where(alert => alert.TenantId == tenantId && alert.RuleId == rule.Id)
                .GroupBy(alert => alert.RuleId)
                .Select(group => new
                {
                    Count = group.Count(),
                    LastTriggeredAt = group.Max(alert => alert.CreationTime)
                })
                .FirstOrDefaultAsync();

            return new AlertRuleListItemDto
            {
                Id = rule.Id,
                Name = rule.Name,
                Description = rule.Description,
                IsEnabled = rule.IsEnabled,
                RuleType = rule.RuleType,
                EventType = rule.EventType,
                WindowMinutes = rule.WindowMinutes,
                ThresholdCount = rule.ThresholdCount,
                GroupByField = rule.GroupByField,
                Severity = rule.Severity,
                TriggeredAlertCount = alertStats?.Count ?? 0,
                LastTriggeredAt = alertStats?.LastTriggeredAt
            };
        }

        private int GetTenantId()
        {
            return AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel rules require an active tenant context.");
        }
    }
}
