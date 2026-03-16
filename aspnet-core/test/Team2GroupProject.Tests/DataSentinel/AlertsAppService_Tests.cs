using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.MultiTenancy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel
{
    public class AlertsAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IAlertsAppService _alertsAppService;
        private readonly IMonitoringIntakeAppService _monitoringIntakeAppService;

        public AlertsAppService_Tests()
        {
            _alertsAppService = Resolve<IAlertsAppService>();
            _monitoringIntakeAppService = Resolve<IMonitoringIntakeAppService>();
        }

        [Fact]
        public async Task Update_status_should_write_history()
        {
            var alertId = await CreateAlertAsync();

            var detail = await _alertsAppService.UpdateStatusAsync(new UpdateSecurityAlertStatusInput
            {
                AlertId = alertId,
                Status = SecurityAlertStatus.InProgress,
                Comment = "Analyst started investigation."
            });

            detail.Status.ShouldBe(SecurityAlertStatus.InProgress);

            await UsingDbContextAsync(async context =>
            {
                var history = await context.AlertStatusHistories
                    .SingleAsync(item => item.TenantId == 1 && item.AlertId == alertId);

                history.FromStatus.ShouldBe(SecurityAlertStatus.Unreviewed);
                history.ToStatus.ShouldBe(SecurityAlertStatus.InProgress);
                history.Comment.ShouldBe("Analyst started investigation.");
            });
        }

        [Fact]
        public async Task Add_note_should_persist_incident_note()
        {
            var alertId = await CreateAlertAsync();

            var note = await _alertsAppService.AddNoteAsync(new CreateIncidentNoteInput
            {
                AlertId = alertId,
                Body = "Confirmed with DBA that maintenance was not scheduled.",
                IsInternal = true
            });

            note.Body.ShouldContain("maintenance");
            note.IsInternal.ShouldBeTrue();

            await UsingDbContextAsync(async context =>
            {
                var storedNote = await context.IncidentNotes
                    .SingleAsync(item => item.TenantId == 1 && item.AlertId == alertId);

                storedNote.Body.ShouldBe("Confirmed with DBA that maintenance was not scheduled.");
                storedNote.IsInternal.ShouldBeTrue();
            });
        }

        [Fact]
        public async Task Dba_without_review_permission_should_not_update_alert_status()
        {
            var alertId = await CreateAlertAsync();
            await CreateTenantUserAsync("dba.operator", StaticRoleNames.Tenants.DatabaseAdministrator);
            LoginAsTenant(AbpTenantBase.DefaultTenantName, "dba.operator");

            await Should.ThrowAsync<AbpAuthorizationException>(async () =>
            {
                await _alertsAppService.UpdateStatusAsync(new UpdateSecurityAlertStatusInput
                {
                    AlertId = alertId,
                    Status = SecurityAlertStatus.Reviewed,
                    Comment = "Attempted review from DBA account."
                });
            });
        }

        [Fact]
        public async Task Get_paged_alerts_should_not_return_other_tenant_data()
        {
            await CreateAlertAsync();

            await UsingDbContextAsync(2, async context =>
            {
                var otherRule = await context.AlertRules.AddAsync(new AlertRule
                {
                    TenantId = 2,
                    Name = "Other tenant failed logins",
                    Description = "Tenant 2 isolation rule",
                    IsEnabled = true,
                    RuleType = AlertRuleType.RepeatedFailedLogins,
                    EventType = ActivityEventType.Login,
                    WindowMinutes = 10,
                    ThresholdCount = 5,
                    GroupByField = "ActorIp",
                    Severity = AlertSeverity.High
                });

                await context.SaveChangesAsync();

                await context.SecurityAlerts.AddAsync(new SecurityAlert
                {
                    TenantId = 2,
                    RuleId = otherRule.Entity.Id,
                    Status = SecurityAlertStatus.Unreviewed,
                    Severity = AlertSeverity.High,
                    Title = "Tenant 2 alert",
                    Summary = "Should stay invisible to tenant 1.",
                    PrimaryActorUser = "tenant2.user",
                    PrimaryActorIp = "203.0.113.201",
                    EventTimeStart = DateTime.UtcNow.AddMinutes(-30),
                    EventTimeEnd = DateTime.UtcNow.AddMinutes(-20),
                    RelatedEventCount = 5,
                    TopEvidenceJson = "{}"
                });
            });

            var alerts = await _alertsAppService.GetPagedAlertsAsync(new GetSecurityAlertsInput
            {
                MaxResultCount = 50,
                SkipCount = 0
            });

            alerts.Items.Any(item => item.Title == "Tenant 2 alert").ShouldBeFalse();
            alerts.Items.Count.ShouldBeGreaterThan(0);
        }

        private async Task<long> CreateAlertAsync()
        {
            var payload = JsonSerializer.Serialize(new[]
            {
                new ActivityEventImportItemDto
                {
                    ServerName = "Primary PostgreSQL Cluster",
                    DatabaseName = "IdentityVault",
                    EventTime = DateTime.UtcNow.Date.AddDays(-1).AddHours(2).AddMinutes(15),
                    EventType = ActivityEventType.PrivilegedAction,
                    ActorUser = "after.hours",
                    ActorIp = "198.51.100.27",
                    ObjectName = "role_membership",
                    Operation = "ALTER ROLE",
                    RowsAffected = 1,
                    DurationMs = 285,
                    IsSuccessful = true,
                    IsPrivilegedAction = true
                }
            });

            var result = await _monitoringIntakeAppService.ImportActivityEventsAsync(new ImportActivityEventsInput
            {
                PayloadJson = payload
            });

            return result.CreatedAlertIds.Single();
        }

        private async Task CreateTenantUserAsync(string userName, string roleName)
        {
            await UsingDbContextAsync(async context =>
            {
                if (await context.Users.AnyAsync(user => user.TenantId == 1 && user.UserName == userName))
                {
                    return;
                }

                var user = new User
                {
                    TenantId = 1,
                    UserName = userName,
                    Name = "DBA",
                    Surname = "Operator",
                    EmailAddress = $"{userName}@boxfusion.local",
                    IsActive = true,
                    IsEmailConfirmed = true,
                    Roles = new System.Collections.Generic.List<UserRole>()
                };
                user.SetNormalizedNames();

                user.Password = new PasswordHasher<User>().HashPassword(user, User.DefaultPassword);
                await context.Users.AddAsync(user);
                await context.SaveChangesAsync();

                var roleId = await context.Roles
                    .Where(role => role.TenantId == 1 && role.Name == roleName)
                    .Select(role => role.Id)
                    .SingleAsync();

                user.Roles.Add(new UserRole(1, user.Id, roleId));
                await context.SaveChangesAsync();
            });
        }
    }
}
