using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Abp.Runtime.Session;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.AlertRules
{
    public class AlertRule_Tests : Team2GroupProjectTestBase
    {
        private readonly IAlertRuleRepository _alertRuleRepository;

        public AlertRule_Tests()
        {
            _alertRuleRepository = Resolve<IAlertRuleRepository>();
        }

        [Fact]
        public async Task Should_persist_alert_rule_with_all_fields()
        {
            var tenantId = AbpSession.GetTenantId();

            var rule = new AlertRule(
                tenantId,
                "Repeated Failed Login",
                AlertRuleType.RepeatedFailure,
                ActivitySeverity.High,
                windowMinutes: 10,
                thresholdCount: 5)
            {
                Description = "Fires when a user fails login 5 times within 10 minutes.",
                EventType = ActivityEventType.Login,
                GroupByField = AlertRuleGroupByField.ActorUser
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.AlertRules.SingleAsync(x => x.Id == rule.Id);

                persisted.TenantId.ShouldBe(tenantId);
                persisted.Name.ShouldBe("Repeated Failed Login");
                persisted.RuleType.ShouldBe(AlertRuleType.RepeatedFailure);
                persisted.Severity.ShouldBe(ActivitySeverity.High);
                persisted.WindowMinutes.ShouldBe(10);
                persisted.ThresholdCount.ShouldBe(5);
                persisted.EventType.ShouldBe(ActivityEventType.Login);
                persisted.GroupByField.ShouldBe(AlertRuleGroupByField.ActorUser);
                persisted.Description.ShouldBe("Fires when a user fails login 5 times within 10 minutes.");
                persisted.IsEnabled.ShouldBeTrue();
            });
        }

        [Fact]
        public async Task Should_persist_out_of_hours_rule_without_event_type_or_group_by()
        {
            var tenantId = AbpSession.GetTenantId();

            // OutOfHours rules use the evaluator's risky-action filter, so EventType and GroupByField are intentionally null.
            var rule = new AlertRule(
                tenantId,
                "Out Of Hours Activity",
                AlertRuleType.OutOfHours,
                ActivitySeverity.Medium,
                windowMinutes: 0,
                thresholdCount: 1);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.AlertRules.SingleAsync(x => x.Id == rule.Id);

                persisted.EventType.ShouldBeNull();
                persisted.GroupByField.ShouldBeNull();
                persisted.RuleType.ShouldBe(AlertRuleType.OutOfHours);
                persisted.WindowMinutes.ShouldBe(0);
                persisted.ThresholdCount.ShouldBe(1);
            });
        }

        [Fact]
        public async Task Should_create_rule_in_disabled_state_when_specified()
        {
            var tenantId = AbpSession.GetTenantId();

            var rule = new AlertRule(
                tenantId,
                "High Write Volume",
                AlertRuleType.ThresholdBased,
                ActivitySeverity.Medium,
                windowMinutes: 5,
                thresholdCount: 1000,
                isEnabled: false)
            {
                EventType = ActivityEventType.Write,
                GroupByField = AlertRuleGroupByField.DatabaseId
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.AlertRules.SingleAsync(x => x.Id == rule.Id);
                persisted.IsEnabled.ShouldBeFalse();
            });
        }

        [Fact]
        public void Should_reject_threshold_rule_without_a_positive_window()
        {
            var tenantId = AbpSession.GetTenantId();

            var exception = Should.Throw<UserFriendlyException>(() => new AlertRule(
                tenantId,
                "Invalid Threshold Rule",
                AlertRuleType.ThresholdBased,
                ActivitySeverity.Medium,
                windowMinutes: 0,
                thresholdCount: 10));

            exception.Message.ShouldBe("ThresholdBased rules require WindowMinutes to be greater than 0.");
        }

        [Fact]
        public async Task GetAllEnabledAsync_should_return_only_enabled_rules_for_tenant()
        {
            var tenantId = AbpSession.GetTenantId();

            var enabledRule = new AlertRule(tenantId, "Enabled Rule", AlertRuleType.ThresholdBased, ActivitySeverity.Low, 15, 100, isEnabled: true);
            var disabledRule = new AlertRule(tenantId, "Disabled Rule", AlertRuleType.ThresholdBased, ActivitySeverity.Low, 15, 100, isEnabled: false);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(enabledRule);
                await context.AlertRules.AddAsync(disabledRule);
            });

            var results = await _alertRuleRepository.GetAllEnabledAsync(tenantId);

            results.ShouldContain(x => x.Id == enabledRule.Id);
            results.ShouldNotContain(x => x.Id == disabledRule.Id);
        }

        [Fact]
        public async Task GetEnabledByTypeAsync_should_filter_by_rule_type()
        {
            var tenantId = AbpSession.GetTenantId();

            var failureRule = new AlertRule(tenantId, "Failure Rule", AlertRuleType.RepeatedFailure, ActivitySeverity.High, 10, 5, isEnabled: true)
            {
                EventType = ActivityEventType.Login
            };
            var thresholdRule = new AlertRule(tenantId, "Threshold Rule", AlertRuleType.ThresholdBased, ActivitySeverity.Medium, 60, 500, isEnabled: true)
            {
                EventType = ActivityEventType.Write
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(failureRule);
                await context.AlertRules.AddAsync(thresholdRule);
            });

            var failureRules = await _alertRuleRepository.GetEnabledByTypeAsync(tenantId, AlertRuleType.RepeatedFailure);

            failureRules.ShouldContain(x => x.Id == failureRule.Id);
            failureRules.ShouldNotContain(x => x.Id == thresholdRule.Id);
        }

        [MultiTenantFact]
        public async Task Should_isolate_alert_rules_by_tenant()
        {
            var ruleForTenantOne = new AlertRule(1, "Tenant One Rule", AlertRuleType.OutOfHours, ActivitySeverity.High, 0, 1);
            var ruleForTenantTwo = new AlertRule(2, "Tenant Two Rule", AlertRuleType.OutOfHours, ActivitySeverity.High, 0, 1);

            await UsingDbContextAsync(1, async context =>
            {
                await context.AlertRules.AddAsync(ruleForTenantOne);
            });

            await UsingDbContextAsync(2, async context =>
            {
                await context.AlertRules.AddAsync(ruleForTenantTwo);
            });

            await UsingDbContextAsync(async context =>
            {
                var tenantOneNames = await context.AlertRules
                    .Where(x => x.TenantId == 1)
                    .Select(x => x.Name)
                    .ToListAsync();

                tenantOneNames.ShouldContain("Tenant One Rule");
                tenantOneNames.ShouldNotContain("Tenant Two Rule");
            });
        }
    }
}
