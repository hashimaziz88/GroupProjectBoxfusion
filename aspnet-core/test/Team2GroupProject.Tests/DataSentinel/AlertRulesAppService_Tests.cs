using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel
{
    public class AlertRulesAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IAlertRulesAppService _alertRulesAppService;

        public AlertRulesAppService_Tests()
        {
            _alertRulesAppService = Resolve<IAlertRulesAppService>();
        }

        [Fact]
        public async Task Update_rule_should_persist_threshold_and_enabled_state()
        {
            var rule = (await _alertRulesAppService.GetRulesAsync()).Items
                .Single(item => item.Name == "Repeated Failed Logins");

            var updated = await _alertRulesAppService.UpdateRuleAsync(new UpdateAlertRuleInput
            {
                Id = rule.Id,
                Name = rule.Name,
                Description = "Updated threshold for test coverage.",
                IsEnabled = false,
                RuleType = rule.RuleType,
                EventType = rule.EventType,
                WindowMinutes = 15,
                ThresholdCount = 7,
                GroupByField = rule.GroupByField,
                Severity = AlertSeverity.High
            });

            updated.IsEnabled.ShouldBeFalse();
            updated.ThresholdCount.ShouldBe(7);

            await UsingDbContextAsync(async context =>
            {
                var storedRule = context.AlertRules.Single(item => item.TenantId == 1 && item.Id == rule.Id);
                storedRule.IsEnabled.ShouldBeFalse();
                storedRule.WindowMinutes.ShouldBe(15);
                storedRule.ThresholdCount.ShouldBe(7);
            });
        }
    }
}
