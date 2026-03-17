using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Abp.Runtime.Session;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.SecurityAlerts
{
    public class SecurityAlert_Tests : Team2GroupProjectTestBase
    {
        private readonly ISecurityAlertRepository _securityAlertRepository;

        public SecurityAlert_Tests()
        {
            _securityAlertRepository = Resolve<ISecurityAlertRepository>();
        }

        [Fact]
        public async Task Should_persist_security_alert_with_rule_event_and_context()
        {
            var tenantId = AbpSession.GetTenantId();
            var server = new MonitoredServer(tenantId, "Prod Cluster", "pg-prod-01", "Production", "Primary monitoring target.");
            var database = new MonitoredDatabase(tenantId, server.Id, "OperationsDb", "PostgreSQL", "Primary database.");
            var table = new MonitoredTable(tenantId, database.Id, "public", "orders", "Order records.");
            var rule = new AlertRule(tenantId, "Write Spike", AlertRuleType.ThresholdBased, ActivitySeverity.High, 10, 500);
            var activityEvent = new ActivityEvent(tenantId, DateTime.UtcNow.AddMinutes(-2), ActivityEventType.Write, "service-account", ActivitySeverity.High, true)
            {
                ServerId = server.Id,
                DatabaseId = database.Id,
                ActorIp = "10.0.0.25",
                ObjectName = "public.orders",
                Operation = "UPDATE",
                EvidenceJson = "{\"indicator\":\"write_spike\"}"
            };

            database.Tables.Add(table);
            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
                await context.AlertRules.AddAsync(rule);
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            var alert = new SecurityAlert(
                tenantId,
                rule.Id,
                "Abnormal write spike detected",
                "Write activity exceeded the configured threshold for OperationsDb.",
                ActivitySeverity.High,
                DateTime.UtcNow,
                activityEvent.EventTime,
                DateTime.UtcNow,
                relatedEventCount: 12)
            {
                TriggeringActivityEventId = activityEvent.Id,
                ServerId = server.Id,
                DatabaseId = database.Id,
                TableId = table.Id,
                PrimaryActorUser = "service-account",
                PrimaryActorIp = "10.0.0.25",
                EvidenceSummaryJson = "{\"topOperation\":\"UPDATE\",\"table\":\"public.orders\"}"
            };

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(alert);
            });

            var persisted = await _securityAlertRepository.GetWithContextAsync(alert.Id);

            persisted.ShouldNotBeNull();
            persisted.Status.ShouldBe(SecurityAlertStatus.New);
            persisted.RuleId.ShouldBe(rule.Id);
            persisted.TriggeringActivityEventId.ShouldBe(activityEvent.Id);
            persisted.DatabaseId.ShouldBe(database.Id);
            persisted.TableId.ShouldBe(table.Id);
            persisted.PrimaryActorUser.ShouldBe("service-account");
            persisted.Rule.Name.ShouldBe("Write Spike");
            persisted.TriggeringActivityEvent.Operation.ShouldBe("UPDATE");
            persisted.Table.Name.ShouldBe("orders");
        }

        [Fact]
        public void Should_track_lifecycle_timestamps_when_status_changes()
        {
            var tenantId = AbpSession.GetTenantId();
            var ruleId = Guid.NewGuid();
            var triggeredAt = DateTime.UtcNow.AddMinutes(-5);

            var alert = new SecurityAlert(
                tenantId,
                ruleId,
                "Repeated failed logins",
                "Multiple login failures were detected for the same actor.",
                ActivitySeverity.Medium,
                triggeredAt,
                triggeredAt.AddMinutes(-2),
                triggeredAt,
                relatedEventCount: 5);

            var acknowledgedAt = DateTime.UtcNow.AddMinutes(-4);
            var investigationAt = DateTime.UtcNow.AddMinutes(-3);
            var resolvedAt = DateTime.UtcNow.AddMinutes(-1);

            alert.Acknowledge(acknowledgedAt, changedByUserId: 7);
            alert.StartInvestigation(investigationAt, changedByUserId: 9);
            alert.Resolve(resolvedAt, changedByUserId: 11);

            alert.Status.ShouldBe(SecurityAlertStatus.Resolved);
            alert.AcknowledgedAt.ShouldBe(acknowledgedAt);
            alert.ResolvedAt.ShouldBe(resolvedAt);
            alert.LastStatusChangedAt.ShouldBe(resolvedAt);
            alert.LastStatusChangedByUserId.ShouldBe(11);
            alert.DismissedAt.ShouldBeNull();
        }

        [Fact]
        public async Task GetOpenAlertsAsync_should_exclude_resolved_and_dismissed_alerts()
        {
            var tenantId = AbpSession.GetTenantId();
            var rule = new AlertRule(tenantId, "Out Of Hours", AlertRuleType.OutOfHours, ActivitySeverity.Medium, 0, 1);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            var openAlert = new SecurityAlert(tenantId, rule.Id, "Open alert", "Still active.", ActivitySeverity.High, DateTime.UtcNow.AddMinutes(-10), DateTime.UtcNow.AddMinutes(-20), DateTime.UtcNow.AddMinutes(-10), 2);
            var resolvedAlert = new SecurityAlert(tenantId, rule.Id, "Resolved alert", "Already resolved.", ActivitySeverity.Low, DateTime.UtcNow.AddMinutes(-9), DateTime.UtcNow.AddMinutes(-15), DateTime.UtcNow.AddMinutes(-9), 1);
            var dismissedAlert = new SecurityAlert(tenantId, rule.Id, "Dismissed alert", "Already dismissed.", ActivitySeverity.Low, DateTime.UtcNow.AddMinutes(-8), DateTime.UtcNow.AddMinutes(-12), DateTime.UtcNow.AddMinutes(-8), 1);

            resolvedAlert.Resolve(DateTime.UtcNow.AddMinutes(-5));
            dismissedAlert.Dismiss(DateTime.UtcNow.AddMinutes(-4));

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(openAlert);
                await context.SecurityAlerts.AddAsync(resolvedAlert);
                await context.SecurityAlerts.AddAsync(dismissedAlert);
            });

            var results = await _securityAlertRepository.GetOpenAlertsAsync(tenantId);

            results.Select(x => x.Title).ShouldContain("Open alert");
            results.Select(x => x.Title).ShouldNotContain("Resolved alert");
            results.Select(x => x.Title).ShouldNotContain("Dismissed alert");
        }

        [Fact]
        public void Should_prevent_reopening_a_terminal_alert()
        {
            var tenantId = AbpSession.GetTenantId();
            var triggeredAt = DateTime.UtcNow.AddMinutes(-5);

            var alert = new SecurityAlert(
                tenantId,
                Guid.NewGuid(),
                "Privileged activity alert",
                "A high-risk privileged operation was flagged.",
                ActivitySeverity.High,
                triggeredAt,
                triggeredAt.AddMinutes(-1),
                triggeredAt,
                relatedEventCount: 3);

            alert.Resolve(DateTime.UtcNow.AddMinutes(-2), changedByUserId: 12);

            Should.Throw<InvalidOperationException>(() =>
                alert.StartInvestigation(DateTime.UtcNow.AddMinutes(-1), changedByUserId: 14));
        }
    }
}
