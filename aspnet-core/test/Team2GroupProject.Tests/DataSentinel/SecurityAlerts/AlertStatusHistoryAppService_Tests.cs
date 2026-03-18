using System;
using System.Threading.Tasks;
using Abp.Runtime.Session;
using Abp.UI;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.SecurityAlerts
{
    public class AlertStatusHistoryAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IAlertStatusHistoryAppService _alertStatusHistoryAppService;
        private readonly ISecurityAlertAppService _securityAlertAppService;

        public AlertStatusHistoryAppService_Tests()
        {
            _alertStatusHistoryAppService = Resolve<IAlertStatusHistoryAppService>();
            _securityAlertAppService = Resolve<ISecurityAlertAppService>();
        }

        [Fact]
        public async Task GetByAlertAsync_should_return_empty_list_when_no_history_exists()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            var history = await _alertStatusHistoryAppService.GetByAlertAsync(alert.Id);

            history.ShouldBeEmpty();
        }

        [Fact]
        public async Task GetByAlertAsync_should_return_history_entries_newest_first()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            await _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
            {
                AlertId = alert.Id,
                NewStatus = SecurityAlertStatus.Acknowledged,
                Comment = "Starting review"
            });

            await _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
            {
                AlertId = alert.Id,
                NewStatus = SecurityAlertStatus.Investigating,
                Comment = "In progress"
            });

            var history = await _alertStatusHistoryAppService.GetByAlertAsync(alert.Id);

            history.Count.ShouldBe(2);
            history[0].ToStatus.ShouldBe(SecurityAlertStatus.Investigating);
            history[1].ToStatus.ShouldBe(SecurityAlertStatus.Acknowledged);
        }

        [Fact]
        public async Task GetByAlertAsync_should_capture_from_and_to_status_correctly()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            await _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
            {
                AlertId = alert.Id,
                NewStatus = SecurityAlertStatus.Resolved,
                Comment = "False alarm"
            });

            var history = await _alertStatusHistoryAppService.GetByAlertAsync(alert.Id);

            history.Count.ShouldBe(1);
            history[0].FromStatus.ShouldBe(SecurityAlertStatus.New);
            history[0].ToStatus.ShouldBe(SecurityAlertStatus.Resolved);
            history[0].Comment.ShouldBe("False alarm");
        }

        [Fact]
        public async Task GetByAlertAsync_should_throw_for_unknown_alert_id()
        {
            await Should.ThrowAsync<UserFriendlyException>(() =>
                _alertStatusHistoryAppService.GetByAlertAsync(Guid.NewGuid()));
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private async Task<SecurityAlert> SeedAlertAsync(int tenantId)
        {
            var rule = new AlertRule(tenantId, "Test Rule", AlertRuleType.ThresholdBased, ActivitySeverity.High, 10, 5);
            var alert = new SecurityAlert(
                tenantId,
                rule.Id,
                "Test Alert",
                "Test alert summary.",
                ActivitySeverity.High,
                DateTime.UtcNow,
                DateTime.UtcNow.AddMinutes(-5),
                DateTime.UtcNow,
                relatedEventCount: 2);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
                await context.SecurityAlerts.AddAsync(alert);
            });

            return alert;
        }
    }
}
