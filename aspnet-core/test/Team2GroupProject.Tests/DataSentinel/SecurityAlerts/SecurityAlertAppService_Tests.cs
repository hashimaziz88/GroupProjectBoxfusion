using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.SecurityAlerts
{
    public class SecurityAlertAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly ISecurityAlertAppService _securityAlertAppService;

        public SecurityAlertAppService_Tests()
        {
            _securityAlertAppService = Resolve<ISecurityAlertAppService>();
        }

        // ── GetPaged tests ────────────────────────────────────────────────────

        [Fact]
        public async Task GetPagedAsync_should_return_all_alerts_for_current_tenant()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 5);

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                MaxResultCount = 50
            });

            result.TotalCount.ShouldBe(5);
            result.Items.Count.ShouldBe(5);
            result.Items.ShouldAllBe(x => x.AlertId.StartsWith("ALT-"));
        }

        [Fact]
        public async Task GetPagedAsync_keyword_filter_matches_on_title()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 3, new SeedAlertOptions { Title = "Login spike detected" });
            await SeedAlertsAsync(tenantId, rule.Id, 2, new SeedAlertOptions { Title = "Bulk export detected" });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                Keyword = "login"
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.Title.ToLower().Contains("login"));
        }

        [Fact]
        public async Task GetPagedAsync_keyword_filter_matches_on_actor_user()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 2, new SeedAlertOptions { ActorUser = "john.doe" });
            await SeedAlertsAsync(tenantId, rule.Id, 3, new SeedAlertOptions { ActorUser = "jane.smith" });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                Keyword = "john"
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.PrimaryActorUser == "john.doe");
        }

        [Fact]
        public async Task GetPagedAsync_severity_filter_returns_only_matching_severity()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 3, new SeedAlertOptions { Severity = ActivitySeverity.High });
            await SeedAlertsAsync(tenantId, rule.Id, 2, new SeedAlertOptions { Severity = ActivitySeverity.Critical });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                Severity = ActivitySeverity.High
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.Severity == ActivitySeverity.High);
        }

        [Fact]
        public async Task GetPagedAsync_status_filter_returns_only_matching_status()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);

            var newAlert = await SeedAlertAsync(tenantId, rule.Id);
            var acknowledgedAlert = await SeedAlertAsync(tenantId, rule.Id);

            await UsingDbContextAsync(async context =>
            {
                var a = await context.SecurityAlerts.FindAsync(acknowledgedAlert.Id);
                a.Acknowledge(DateTime.UtcNow);
            });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                Status = SecurityAlertStatus.New
            });

            result.TotalCount.ShouldBe(1);
            result.Items.Single().Id.ShouldBe(newAlert.Id);
        }

        [Fact]
        public async Task GetPagedAsync_database_id_filter_returns_only_matching_database()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var database = await CreateDatabaseAsync(tenantId);

            await SeedAlertsAsync(tenantId, rule.Id, 2, new SeedAlertOptions { DatabaseId = database.Id });
            await SeedAlertsAsync(tenantId, rule.Id, 3);

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                DatabaseId = database.Id
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.DatabaseId == database.Id);
        }

        [Fact]
        public async Task GetPagedAsync_includes_database_name_when_database_id_is_set()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var database = await CreateDatabaseAsync(tenantId);

            await SeedAlertsAsync(tenantId, rule.Id, 1, new SeedAlertOptions { DatabaseId = database.Id });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                DatabaseId = database.Id
            });

            result.Items.Single().DatabaseName.ShouldBe("ProdDb");
        }

        [Fact]
        public async Task GetPagedAsync_risk_score_increases_with_severity()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 1, new SeedAlertOptions { Severity = ActivitySeverity.Low });
            await SeedAlertsAsync(tenantId, rule.Id, 1, new SeedAlertOptions { Severity = ActivitySeverity.Critical });

            var result = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                MaxResultCount = 50
            });

            var low = result.Items.First(x => x.Severity == ActivitySeverity.Low);
            var critical = result.Items.First(x => x.Severity == ActivitySeverity.Critical);

            critical.RiskScore.ShouldBeGreaterThan(low.RiskScore);
        }

        [Fact]
        public async Task GetPagedAsync_pagination_skip_and_take_are_applied_correctly()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            await SeedAlertsAsync(tenantId, rule.Id, 10);

            var firstPage = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                SkipCount = 0,
                MaxResultCount = 3
            });

            var secondPage = await _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput
            {
                SkipCount = 3,
                MaxResultCount = 3
            });

            firstPage.TotalCount.ShouldBe(10);
            firstPage.Items.Count.ShouldBe(3);
            secondPage.Items.Count.ShouldBe(3);

            var firstPageIds = firstPage.Items.Select(x => x.Id).ToList();
            var secondPageIds = secondPage.Items.Select(x => x.Id).ToList();
            firstPageIds.Intersect(secondPageIds).ShouldBeEmpty();
        }

        // ── GetById tests ─────────────────────────────────────────────────────

        [Fact]
        public async Task GetByIdAsync_should_return_full_alert_detail()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var alert = await SeedAlertAsync(tenantId, rule.Id, new SeedAlertOptions
            {
                Title = "Unusual export volume",
                ActorUser = "john.doe",
                Severity = ActivitySeverity.Critical
            });

            var detail = await _securityAlertAppService.GetByIdAsync(alert.Id);

            detail.Id.ShouldBe(alert.Id);
            detail.Title.ShouldBe("Unusual export volume");
            detail.PrimaryActorUser.ShouldBe("john.doe");
            detail.Severity.ShouldBe(ActivitySeverity.Critical);
            detail.AlertId.ShouldStartWith("ALT-");
        }

        [Fact]
        public async Task GetByIdAsync_should_include_recommended_actions()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var alert = await SeedAlertAsync(tenantId, rule.Id);

            var detail = await _securityAlertAppService.GetByIdAsync(alert.Id);

            detail.RecommendedActions.ShouldNotBeEmpty();
            detail.RecommendedActions.ShouldContain("Review user activity history for patterns");
        }

        [Fact]
        public async Task GetByIdAsync_should_include_database_and_table_names()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var (database, table) = await CreateDatabaseWithTableAsync(tenantId);

            var alert = await SeedAlertAsync(tenantId, rule.Id, new SeedAlertOptions
            {
                DatabaseId = database.Id,
                TableId = table.Id
            });

            var detail = await _securityAlertAppService.GetByIdAsync(alert.Id);

            detail.DatabaseName.ShouldBe("ProdDb");
            detail.TableName.ShouldBe("customers");
        }

        // ── UpdateStatus tests ────────────────────────────────────────────────

        [Fact]
        public async Task UpdateStatusAsync_should_transition_new_alert_to_acknowledged()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var alert = await SeedAlertAsync(tenantId, rule.Id);

            await _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
            {
                AlertId = alert.Id,
                NewStatus = SecurityAlertStatus.Acknowledged,
                Comment = "Reviewing now"
            });

            var persisted = await UsingDbContextAsync(async context =>
                await context.SecurityAlerts.FindAsync(alert.Id));

            persisted.Status.ShouldBe(SecurityAlertStatus.Acknowledged);
            persisted.AcknowledgedAt.ShouldNotBeNull();
        }

        [Fact]
        public async Task UpdateStatusAsync_should_transition_to_resolved()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var alert = await SeedAlertAsync(tenantId, rule.Id);

            await _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
            {
                AlertId = alert.Id,
                NewStatus = SecurityAlertStatus.Resolved
            });

            var persisted = await UsingDbContextAsync(async context =>
                await context.SecurityAlerts.FindAsync(alert.Id));

            persisted.Status.ShouldBe(SecurityAlertStatus.Resolved);
            persisted.ResolvedAt.ShouldNotBeNull();
        }

        [Fact]
        public async Task UpdateStatusAsync_should_require_alerts_review_permission()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _securityAlertAppService.UpdateStatusAsync(new UpdateAlertStatusInput
                    {
                        AlertId = Guid.NewGuid(),
                        NewStatus = SecurityAlertStatus.Acknowledged
                    }));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }

        // ── GetFilterOptions tests ────────────────────────────────────────────

        [Fact]
        public async Task GetFilterOptionsAsync_returns_only_databases_that_have_alerts()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var rule = await CreateRuleAsync(tenantId);
            var dbWithAlerts = await CreateDatabaseAsync(tenantId);
            await CreateDatabaseAsync(tenantId); // second database, no alerts

            await SeedAlertsAsync(tenantId, rule.Id, 2, new SeedAlertOptions { DatabaseId = dbWithAlerts.Id });

            var options = await _securityAlertAppService.GetFilterOptionsAsync();

            options.Databases.ShouldContain(x => x.Id == dbWithAlerts.Id);
            options.Databases.Count.ShouldBe(1);
        }

        // ── Authorization tests ───────────────────────────────────────────────

        [Fact]
        public async Task GetPagedAsync_should_require_authenticated_user()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _securityAlertAppService.GetPagedAsync(new GetSecurityAlertsInput()));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private sealed class SeedAlertOptions
        {
            public string Title = "Suspicious activity detected";
            public string Summary = "Automated detection flagged this event.";
            public ActivitySeverity Severity = ActivitySeverity.High;
            public string ActorUser = "test_user";
            public Guid? DatabaseId = null;
            public Guid? TableId = null;
        }

        private async Task<AlertRule> CreateRuleAsync(int tenantId)
        {
            var rule = new AlertRule(tenantId, "Test Rule", AlertRuleType.ThresholdBased, ActivitySeverity.High, 10, 5);

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
            });

            return rule;
        }

        private async Task<SecurityAlert> SeedAlertAsync(int tenantId, Guid ruleId, SeedAlertOptions opts = null)
        {
            opts ??= new SeedAlertOptions();

            var alert = new SecurityAlert(
                tenantId,
                ruleId,
                opts.Title,
                opts.Summary,
                opts.Severity,
                DateTime.UtcNow,
                DateTime.UtcNow.AddMinutes(-5),
                DateTime.UtcNow,
                relatedEventCount: 3)
            {
                PrimaryActorUser = opts.ActorUser,
                DatabaseId = opts.DatabaseId,
                TableId = opts.TableId
            };

            await UsingDbContextAsync(async context =>
            {
                await context.SecurityAlerts.AddAsync(alert);
            });

            return alert;
        }

        private async Task SeedAlertsAsync(int tenantId, Guid ruleId, int count, SeedAlertOptions opts = null)
        {
            opts ??= new SeedAlertOptions();

            for (var i = 0; i < count; i++)
            {
                await SeedAlertAsync(tenantId, ruleId, opts);
            }
        }

        private async Task<MonitoredDatabase> CreateDatabaseAsync(int tenantId)
        {
            var server = new MonitoredServer(tenantId, "Prod Server", "pg-prod-01", "Production", "Production server.");
            var database = new MonitoredDatabase(tenantId, server.Id, "ProdDb", "PostgreSQL", "Production database.");

            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            return database;
        }

        private async Task<(MonitoredDatabase, MonitoredTable)> CreateDatabaseWithTableAsync(int tenantId)
        {
            var server = new MonitoredServer(tenantId, "Prod Server", "pg-prod-01", "Production", "Production server.");
            var database = new MonitoredDatabase(tenantId, server.Id, "ProdDb", "PostgreSQL", "Production database.");
            var table = new MonitoredTable(tenantId, database.Id, "public", "customers", "Customer records.");

            database.Tables.Add(table);
            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            return (database, table);
        }
    }
}
