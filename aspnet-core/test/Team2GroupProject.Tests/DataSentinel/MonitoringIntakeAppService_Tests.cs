using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Shouldly;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel
{
    public class MonitoringIntakeAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IMonitoringIntakeAppService _monitoringIntakeAppService;

        public MonitoringIntakeAppService_Tests()
        {
            _monitoringIntakeAppService = Resolve<IMonitoringIntakeAppService>();
        }

        [Fact]
        public async Task Import_should_create_alert_for_repeated_failed_logins()
        {
            var baseTime = DateTime.UtcNow.AddMinutes(-20);
            var payload = JsonSerializer.Serialize(Enumerable.Range(0, 5).Select(index => new ActivityEventImportItemDto
            {
                ServerName = "Primary PostgreSQL Cluster",
                DatabaseName = "IdentityVault",
                EventTime = baseTime.AddMinutes(index * 2),
                EventType = ActivityEventType.Login,
                ActorUser = "unknown.root",
                ActorIp = "203.0.113.45",
                ObjectName = "IdentityVault",
                Operation = "LOGIN",
                DurationMs = 90,
                IsSuccessful = false,
                FailureReason = "invalid_password"
            }));

            var result = await _monitoringIntakeAppService.ImportActivityEventsAsync(new ImportActivityEventsInput
            {
                PayloadJson = payload
            });

            result.CreatedEventCount.ShouldBe(5);
            result.CreatedAlertCount.ShouldBeGreaterThan(0);

            await UsingDbContextAsync(async context =>
            {
                var rule = context.AlertRules.Single(alertRule => alertRule.TenantId == 1 && alertRule.Name == "Repeated Failed Logins");
                context.SecurityAlerts.Count(alert => alert.TenantId == 1 && alert.RuleId == rule.Id).ShouldBeGreaterThan(0);
            });
        }

        [Fact]
        public async Task Import_should_not_create_alert_when_failed_login_threshold_is_not_met()
        {
            var baseTime = DateTime.UtcNow.AddMinutes(-25);
            var payload = JsonSerializer.Serialize(Enumerable.Range(0, 3).Select(index => new ActivityEventImportItemDto
            {
                ServerName = "Primary PostgreSQL Cluster",
                DatabaseName = "IdentityVault",
                EventTime = baseTime.AddMinutes(index * 2),
                EventType = ActivityEventType.Login,
                ActorUser = "limited.failures",
                ActorIp = "203.0.113.77",
                ObjectName = "IdentityVault",
                Operation = "LOGIN",
                DurationMs = 65,
                IsSuccessful = false,
                FailureReason = "invalid_password"
            }));

            var result = await _monitoringIntakeAppService.ImportActivityEventsAsync(new ImportActivityEventsInput
            {
                PayloadJson = payload
            });

            result.CreatedEventCount.ShouldBe(3);
            result.CreatedAlertCount.ShouldBe(0);
        }

        [Fact]
        public async Task Import_should_create_critical_alert_for_out_of_hours_privileged_activity()
        {
            var payload = JsonSerializer.Serialize(new List<ActivityEventImportItemDto>
            {
                new ActivityEventImportItemDto
                {
                    ServerName = "Primary PostgreSQL Cluster",
                    DatabaseName = "IdentityVault",
                    EventTime = DateTime.UtcNow.Date.AddDays(-1).AddHours(2).AddMinutes(30),
                    EventType = ActivityEventType.PrivilegedAction,
                    ActorUser = "dba.afterhours",
                    ActorIp = "198.51.100.12",
                    ObjectName = "role_membership",
                    Operation = "ALTER ROLE",
                    RowsAffected = 1,
                    DurationMs = 410,
                    IsSuccessful = true,
                    IsPrivilegedAction = true
                }
            });

            var result = await _monitoringIntakeAppService.ImportActivityEventsAsync(new ImportActivityEventsInput
            {
                PayloadJson = payload
            });

            result.CreatedAlertCount.ShouldBeGreaterThan(0);

            await UsingDbContextAsync(async context =>
            {
                var rule = context.AlertRules.Single(alertRule => alertRule.TenantId == 1 && alertRule.Name == "Out-of-Hours Privileged Action");
                var alert = context.SecurityAlerts.Single(securityAlert => securityAlert.TenantId == 1 && securityAlert.RuleId == rule.Id);

                alert.Severity.ShouldBe(AlertSeverity.Critical);
                alert.Status.ShouldBe(SecurityAlertStatus.Unreviewed);
            });
        }
    }
}
