using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Domain.Uow;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.DataSentinel.ActivityEvents;

namespace Team2GroupProject.DataSentinel.AlertRules
{
    public class DefaultAlertRuleSeeder : IDefaultAlertRuleSeeder, ITransientDependency
    {
        private readonly IAlertRuleRepository _alertRuleRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public DefaultAlertRuleSeeder(
            IAlertRuleRepository alertRuleRepository,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _alertRuleRepository = alertRuleRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task<int> EnsureSeededAsync(int tenantId)
        {
            var existingRuleCount = await _alertRuleRepository.GetAll()
                .CountAsync(x => x.TenantId == tenantId);

            if (existingRuleCount > 0)
            {
                return 0;
            }

            var defaultRules = BuildDefaultRules(tenantId);

            foreach (var rule in defaultRules)
            {
                await _alertRuleRepository.InsertAsync(rule);
            }

            if (defaultRules.Count > 0)
            {
                await _unitOfWorkManager.Current.SaveChangesAsync();
            }

            return defaultRules.Count;
        }

        private static List<AlertRule> BuildDefaultRules(int tenantId)
        {
            return new List<AlertRule>
            {
                new AlertRule(
                    tenantId,
                    "Default: Failed login burst",
                    AlertRuleType.RepeatedFailure,
                    ActivitySeverity.High,
                    windowMinutes: 15,
                    thresholdCount: 3)
                {
                    Description = "Creates an alert when the same actor accumulates repeated failed logins within a short window.",
                    EventType = ActivityEventType.Login,
                    GroupByField = AlertRuleGroupByField.ActorUser
                },
                new AlertRule(
                    tenantId,
                    "Default: Write spike",
                    AlertRuleType.ThresholdBased,
                    ActivitySeverity.High,
                    windowMinutes: 15,
                    thresholdCount: 3)
                {
                    Description = "Creates an alert when the same actor performs an unusual burst of write activity.",
                    EventType = ActivityEventType.Write,
                    GroupByField = AlertRuleGroupByField.ActorUser
                },
                new AlertRule(
                    tenantId,
                    "Default: Large write operation",
                    AlertRuleType.BulkOperation,
                    ActivitySeverity.Critical,
                    windowMinutes: 15,
                    thresholdCount: 500)
                {
                    Description = "Creates an alert when a single write operation affects a large number of rows.",
                    EventType = ActivityEventType.Write,
                    GroupByField = AlertRuleGroupByField.ActorUser
                },
                new AlertRule(
                    tenantId,
                    "Default: After-hours risky activity",
                    AlertRuleType.OutOfHours,
                    ActivitySeverity.High,
                    windowMinutes: 0,
                    thresholdCount: 1)
                {
                    Description = "Creates an alert for risky write or privileged activity happening outside normal business hours."
                },
                new AlertRule(
                    tenantId,
                    "Default: Privileged action activity",
                    AlertRuleType.PrivilegedAction,
                    ActivitySeverity.High,
                    windowMinutes: 0,
                    thresholdCount: 1)
                {
                    Description = "Creates an alert whenever a privileged or permission-changing action is recorded."
                }
            };
        }
    }
}
