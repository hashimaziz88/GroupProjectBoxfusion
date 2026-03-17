using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Runtime.Session;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.SecurityAlerts
{
    public class SecurityAlertInvestigation_Tests : Team2GroupProjectTestBase
    {
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IIncidentNoteRepository _incidentNoteRepository;
        private readonly IAlertStatusHistoryRepository _alertStatusHistoryRepository;

        public SecurityAlertInvestigation_Tests()
        {
            _securityAlertRepository = Resolve<ISecurityAlertRepository>();
            _incidentNoteRepository = Resolve<IIncidentNoteRepository>();
            _alertStatusHistoryRepository = Resolve<IAlertStatusHistoryRepository>();
        }

        [Fact]
        public async Task Should_persist_notes_and_status_history_for_an_alert()
        {
            var tenantId = AbpSession.GetTenantId();
            var rule = new AlertRule(tenantId, "Repeated failures", AlertRuleType.RepeatedFailure, ActivitySeverity.High, 15, 5);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            var alert = new SecurityAlert(
                tenantId,
                rule.Id,
                "Repeated failed logins",
                "Five failed login attempts were detected for the same actor.",
                ActivitySeverity.High,
                DateTime.UtcNow,
                DateTime.UtcNow.AddMinutes(-15),
                DateTime.UtcNow,
                relatedEventCount: 5);

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(alert);
            });

            var note = new IncidentNote(tenantId, alert.Id, "Escalated to on-call analyst for review.", isInternal: true)
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-2),
                CreatorUserId = 21
            };

            var statusHistory = new AlertStatusHistory(
                tenantId,
                alert.Id,
                SecurityAlertStatus.New,
                SecurityAlertStatus.Acknowledged,
                "Analyst accepted the alert for investigation.")
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-1),
                CreatorUserId = 21
            };

            await UsingDbContextAsync(async context =>
            {
                await context.IncidentNotes.AddAsync(note);
                await context.AlertStatusHistoryEntries.AddAsync(statusHistory);
            });

            var persistedAlert = await _securityAlertRepository.GetWithContextAsync(alert.Id);

            persistedAlert.ShouldNotBeNull();
            persistedAlert.Notes.Count.ShouldBe(1);
            persistedAlert.StatusHistoryEntries.Count.ShouldBe(1);
            persistedAlert.Notes.Single().Body.ShouldBe("Escalated to on-call analyst for review.");
            persistedAlert.Notes.Single().IsInternal.ShouldBeTrue();
            persistedAlert.StatusHistoryEntries.Single().FromStatus.ShouldBe(SecurityAlertStatus.New);
            persistedAlert.StatusHistoryEntries.Single().ToStatus.ShouldBe(SecurityAlertStatus.Acknowledged);
        }

        [Fact]
        public async Task IncidentNoteRepository_should_return_notes_in_creation_order()
        {
            var tenantId = AbpSession.GetTenantId();
            var alert = await CreateAlertAsync(tenantId, "High-volume read activity");

            var firstNote = new IncidentNote(tenantId, alert.Id, "Initial triage note.", isInternal: false)
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-5),
                CreatorUserId = 31
            };

            var secondNote = new IncidentNote(tenantId, alert.Id, "Confirmed with DBA that maintenance is not scheduled.", isInternal: true)
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-1),
                CreatorUserId = 32
            };

            await UsingDbContextAsync(async context =>
            {
                await context.IncidentNotes.AddAsync(firstNote);
                await context.IncidentNotes.AddAsync(secondNote);
            });

            var notes = await _incidentNoteRepository.GetByAlertAsync(alert.Id);

            notes.Select(x => x.Body).ToArray().ShouldBe(new[]
            {
                "Initial triage note.",
                "Confirmed with DBA that maintenance is not scheduled."
            });
        }

        [Fact]
        public async Task AlertStatusHistoryRepository_should_return_transitions_in_creation_order()
        {
            var tenantId = AbpSession.GetTenantId();
            var alert = await CreateAlertAsync(tenantId, "Out-of-hours privileged access");

            var acknowledged = new AlertStatusHistory(
                tenantId,
                alert.Id,
                SecurityAlertStatus.New,
                SecurityAlertStatus.Acknowledged,
                "Analyst acknowledged the alert.")
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-4),
                CreatorUserId = 40
            };

            var investigating = new AlertStatusHistory(
                tenantId,
                alert.Id,
                SecurityAlertStatus.Acknowledged,
                SecurityAlertStatus.Investigating,
                "Investigation started after validating the actor.")
            {
                CreationTime = DateTime.UtcNow.AddMinutes(-2),
                CreatorUserId = 41
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertStatusHistoryEntries.AddAsync(acknowledged);
                await context.AlertStatusHistoryEntries.AddAsync(investigating);
            });

            var history = await _alertStatusHistoryRepository.GetByAlertAsync(alert.Id);

            history.Select(x => x.ToStatus).ToArray().ShouldBe(new[]
            {
                SecurityAlertStatus.Acknowledged,
                SecurityAlertStatus.Investigating
            });
        }

        private async Task<SecurityAlert> CreateAlertAsync(int tenantId, string title)
        {
            var rule = new AlertRule(tenantId, $"{title} rule", AlertRuleType.ThresholdBased, ActivitySeverity.Medium, 10, 3);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            var alert = new SecurityAlert(
                tenantId,
                rule.Id,
                title,
                $"{title} summary.",
                ActivitySeverity.Medium,
                DateTime.UtcNow,
                DateTime.UtcNow.AddMinutes(-10),
                DateTime.UtcNow,
                relatedEventCount: 3);

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(alert);
            });

            return alert;
        }
    }
}
