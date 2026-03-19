using System;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Dashboards;
using Team2GroupProject.DataSentinel.Dashboards.Dto;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.Dashboards
{
    public class DashboardsAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IDashboardsAppService _dashboardsAppService;

        public DashboardsAppService_Tests()
        {
            _dashboardsAppService = Resolve<IDashboardsAppService>();
        }

        [Fact]
        public async Task GetSummaryAsync_should_aggregate_key_dashboard_metrics()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var (server, database, table) = await CreateContextAsync(tenantId);

            await SeedActivityEventAsync(
                tenantId,
                ActivityEventType.Write,
                ActivitySeverity.High,
                isSuccess: false,
                isOutOfHours: true,
                server.Id,
                database.Id);

            await SeedActivityEventAsync(
                tenantId,
                ActivityEventType.Read,
                ActivitySeverity.Low,
                isSuccess: true,
                isOutOfHours: false,
                server.Id,
                database.Id);

            await SeedAlertAsync(
                tenantId,
                rule.Id,
                ActivitySeverity.Critical,
                SecurityAlertStatus.New,
                database.Id,
                table.Id);

            await SeedRiskProfileAsync(tenantId, "alice", 88, UserRiskLevel.Critical);

            var result = await _dashboardsAppService.GetSummaryAsync(new DashboardWindowInput
            {
                WindowDays = 7
            });

            result.TotalAlerts.ShouldBe(1);
            result.CriticalAlerts.ShouldBe(1);
            result.NewAlerts.ShouldBe(1);
            result.TotalFailedAccessAttempts.ShouldBe(1);
            result.SuspiciousWriteActivityCount.ShouldBe(1);
            result.HighRiskUsersCount.ShouldBe(1);
        }

        [Fact]
        public async Task GetActivityTrendsAsync_should_return_bucketed_series_for_events_and_alerts()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var (server, database, _) = await CreateContextAsync(tenantId);

            await SeedActivityEventAsync(
                tenantId,
                ActivityEventType.Read,
                ActivitySeverity.Low,
                isSuccess: true,
                isOutOfHours: false,
                server.Id,
                database.Id);

            await SeedActivityEventAsync(
                tenantId,
                ActivityEventType.Write,
                ActivitySeverity.Medium,
                isSuccess: true,
                isOutOfHours: false,
                server.Id,
                database.Id);

            await SeedActivityEventAsync(
                tenantId,
                ActivityEventType.Login,
                ActivitySeverity.High,
                isSuccess: false,
                isOutOfHours: false,
                server.Id,
                database.Id);

            await SeedAlertAsync(
                tenantId,
                rule.Id,
                ActivitySeverity.High,
                SecurityAlertStatus.New,
                database.Id,
                null);

            var result = await _dashboardsAppService.GetActivityTrendsAsync(new DashboardTrendInput
            {
                WindowDays = 7,
                BucketHours = 24
            });

            result.Reads.Sum(x => x.Count).ShouldBe(1);
            result.Writes.Sum(x => x.Count).ShouldBe(1);
            result.FailedAccess.Sum(x => x.Count).ShouldBe(1);
            result.Alerts.Sum(x => x.Count).ShouldBe(1);
        }

        [Fact]
        public async Task GetTopRiskyUsersAndEntitiesAsync_should_return_ranked_users_and_entities()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var (server, database, table) = await CreateContextAsync(tenantId);

            await SeedRiskProfileAsync(tenantId, "alice", 90, UserRiskLevel.Critical);
            await SeedRiskProfileAsync(tenantId, "bob", 65, UserRiskLevel.High);

            await SeedAlertAsync(
                tenantId,
                rule.Id,
                ActivitySeverity.Critical,
                SecurityAlertStatus.New,
                database.Id,
                table.Id);

            await SeedAlertAsync(
                tenantId,
                rule.Id,
                ActivitySeverity.High,
                SecurityAlertStatus.New,
                database.Id,
                table.Id);

            var result = await _dashboardsAppService.GetTopRiskyUsersAndEntitiesAsync(
                new GetTopRiskyUsersAndEntitiesInput
                {
                    WindowDays = 7,
                    MaxUsers = 5,
                    MaxEntities = 5
                });

            result.Users.Count.ShouldBeGreaterThan(1);
            result.Users.First().ActorUser.ShouldBe("alice");
            result.Databases.ShouldContain(x => x.Name == "ProdDb" && x.AlertCount == 2);
            result.Tables.ShouldContain(x => x.Name == "customers" && x.HighSeverityAlertCount == 2);
        }

        private async Task<AlertRule> CreateRuleAsync(int tenantId)
        {
            var rule = new AlertRule(
                tenantId,
                "Dashboard Rule",
                AlertRuleType.ThresholdBased,
                ActivitySeverity.High,
                10,
                5);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            return rule;
        }

        private async Task<(MonitoredServer Server, MonitoredDatabase Database, MonitoredTable Table)> CreateContextAsync(
            int tenantId)
        {
            var server = new MonitoredServer(
                tenantId,
                "Prod Server",
                "pg-prod-01",
                "Production",
                "Production server.");
            var database = new MonitoredDatabase(
                tenantId,
                server.Id,
                "ProdDb",
                "PostgreSQL",
                "Production database.");
            var table = new MonitoredTable(
                tenantId,
                database.Id,
                "public",
                "customers",
                "Customer records.");

            database.Tables.Add(table);
            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            return (server, database, table);
        }

        private async Task SeedActivityEventAsync(
            int tenantId,
            ActivityEventType eventType,
            ActivitySeverity severity,
            bool isSuccess,
            bool isOutOfHours,
            Guid serverId,
            Guid databaseId)
        {
            var activityEvent = new ActivityEvent(
                tenantId,
                DateTime.UtcNow.AddHours(-1),
                eventType,
                "alice",
                severity,
                isSuccess)
            {
                ServerId = serverId,
                DatabaseId = databaseId,
                SourceSystem = "TestHarness",
                SourceEventKey = Guid.NewGuid().ToString("N"),
                IsOutOfHours = isOutOfHours,
                ActorIp = "10.0.0.10",
                Operation = eventType.ToString().ToUpperInvariant()
            };

            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(activityEvent);
            });
        }

        private async Task SeedAlertAsync(
            int tenantId,
            Guid ruleId,
            ActivitySeverity severity,
            SecurityAlertStatus status,
            Guid databaseId,
            Guid? tableId)
        {
            var alert = new SecurityAlert(
                tenantId,
                ruleId,
                "Suspicious activity detected",
                "Dashboard test alert.",
                severity,
                DateTime.UtcNow.AddHours(-2),
                DateTime.UtcNow.AddHours(-2),
                DateTime.UtcNow.AddHours(-1),
                3)
            {
                DatabaseId = databaseId,
                TableId = tableId,
                PrimaryActorUser = "alice",
                PrimaryActorIp = "10.0.0.10"
            };

            if (status == SecurityAlertStatus.Resolved)
            {
                alert.Resolve(DateTime.UtcNow);
            }
            else if (status == SecurityAlertStatus.Dismissed)
            {
                alert.Dismiss(DateTime.UtcNow);
            }
            else if (status == SecurityAlertStatus.Acknowledged)
            {
                alert.Acknowledge(DateTime.UtcNow);
            }
            else if (status == SecurityAlertStatus.Investigating)
            {
                alert.StartInvestigation(DateTime.UtcNow);
            }

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(alert);
            });
        }

        private async Task SeedRiskProfileAsync(
            int tenantId,
            string actorUser,
            int riskScore,
            UserRiskLevel riskLevel)
        {
            var profile = new UserRiskProfile(tenantId, actorUser)
            {
                RiskScore = riskScore,
                RiskLevel = riskLevel,
                AlertCount = 3,
                FailedLoginCount = 2,
                PrivilegedActionCount = 1,
                HighSeverityAlertCount = riskLevel >= UserRiskLevel.High ? 2 : 0,
                OutOfHoursEventCount = 1,
                LastEvaluatedAt = DateTime.UtcNow,
                ActorIp = "10.0.0.10"
            };

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(profile);
            });
        }
    }
}
