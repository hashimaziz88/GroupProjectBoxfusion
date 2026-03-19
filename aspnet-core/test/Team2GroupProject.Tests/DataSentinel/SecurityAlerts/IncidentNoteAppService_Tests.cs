using System;
using System.Threading.Tasks;
using Abp.Authorization;
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
    public class IncidentNoteAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IIncidentNoteAppService _incidentNoteAppService;

        public IncidentNoteAppService_Tests()
        {
            _incidentNoteAppService = Resolve<IIncidentNoteAppService>();
        }

        [Fact]
        public async Task CreateAsync_should_reject_empty_body()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            await Should.ThrowAsync<UserFriendlyException>(() =>
                _incidentNoteAppService.CreateAsync(new CreateIncidentNoteInput
                {
                    AlertId = alert.Id,
                    Body = "   "
                }));
        }

        [Fact]
        public async Task CreateAsync_should_reject_unknown_alert_id()
        {
            await Should.ThrowAsync<UserFriendlyException>(() =>
                _incidentNoteAppService.CreateAsync(new CreateIncidentNoteInput
                {
                    AlertId = Guid.NewGuid(),
                    Body = "Some note"
                }));
        }

        [Fact]
        public async Task GetByAlertAsync_should_return_notes_ordered_newest_first()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            await _incidentNoteAppService.CreateAsync(new CreateIncidentNoteInput
            {
                AlertId = alert.Id,
                Body = "First note"
            });

            await _incidentNoteAppService.CreateAsync(new CreateIncidentNoteInput
            {
                AlertId = alert.Id,
                Body = "Second note"
            });

            var notes = await _incidentNoteAppService.GetByAlertAsync(alert.Id);

            notes.Count.ShouldBe(2);
            notes[0].Body.ShouldBe("Second note");
            notes[1].Body.ShouldBe("First note");
        }

        [Fact]
        public async Task GetByAlertAsync_should_return_empty_list_when_no_notes_exist()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var alert = await SeedAlertAsync(tenantId);

            var notes = await _incidentNoteAppService.GetByAlertAsync(alert.Id);

            notes.ShouldBeEmpty();
        }

        [Fact]
        public async Task CreateAsync_should_require_alerts_review_permission()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _incidentNoteAppService.CreateAsync(new CreateIncidentNoteInput
                    {
                        AlertId = Guid.NewGuid(),
                        Body = "Some note"
                    }));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
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
