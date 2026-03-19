using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.ActivityEvents.Dto;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.Monitoring.Dto;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.Monitoring
{
    public class MonitoringInfrastructureAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IMonitoringInfrastructureAppService _monitoringInfrastructureAppService;
        private readonly IActivityEventAppService _activityEventAppService;

        public MonitoringInfrastructureAppService_Tests()
        {
            _monitoringInfrastructureAppService = Resolve<IMonitoringInfrastructureAppService>();
            _activityEventAppService = Resolve<IActivityEventAppService>();
        }

        [Fact]
        public async Task BootstrapDemoAsync_should_create_tenant_scoped_monitored_references_and_be_idempotent()
        {
            var firstRun = await _monitoringInfrastructureAppService.BootstrapDemoAsync(new BootstrapMonitoringDemoInput());

            firstRun.CreatedServersCount.ShouldBe(1);
            firstRun.CreatedDatabasesCount.ShouldBe(2);
            firstRun.CreatedTablesCount.ShouldBe(6);
            firstRun.Servers.Count.ShouldBeGreaterThan(0);
            firstRun.Servers.First().Databases.Count.ShouldBeGreaterThan(0);
            firstRun.Servers.First().Databases.First().Tables.Count.ShouldBeGreaterThan(0);

            var secondRun = await _monitoringInfrastructureAppService.BootstrapDemoAsync(new BootstrapMonitoringDemoInput());

            secondRun.CreatedServersCount.ShouldBe(0);
            secondRun.CreatedDatabasesCount.ShouldBe(0);
            secondRun.CreatedTablesCount.ShouldBe(0);

            var persistedCounts = await UsingDbContextAsync(async context =>
                await Task.FromResult(new
                {
                    Servers = context.MonitoredServers.Count(),
                    Databases = context.MonitoredDatabases.Count(),
                    Tables = context.MonitoredTables.Count()
                }));

            persistedCounts.Servers.ShouldBe(1);
            persistedCounts.Databases.ShouldBe(2);
            persistedCounts.Tables.ShouldBe(6);

            var persistedRuleCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.AlertRules.Count()));

            persistedRuleCount.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task GetMonitoredServersAsync_should_only_return_current_tenant_infrastructure()
        {
            await _monitoringInfrastructureAppService.BootstrapDemoAsync(new BootstrapMonitoringDemoInput());

            await UsingDbContextAsync(async context =>
            {
                var otherTenantServer = new MonitoredServer(42, "Other Tenant Server", "tenant-42-pg-demo-01", "Demo", "Other tenant server.");
                var otherTenantDatabase = new MonitoredDatabase(42, otherTenantServer.Id, "OtherTenantDb", "PostgreSQL", "Other tenant database.");
                otherTenantServer.Databases.Add(otherTenantDatabase);
                await context.MonitoredServers.AddAsync(otherTenantServer);
            });

            var servers = await _monitoringInfrastructureAppService.GetMonitoredServersAsync();

            servers.Items.Count.ShouldBe(1);
            servers.Items.ShouldAllBe(x => x.HostName != "tenant-42-pg-demo-01");
        }

        [Fact]
        public async Task BootstrapDemoAsync_should_enable_successful_ingestion_without_manual_database_setup()
        {
            var bootstrap = await _monitoringInfrastructureAppService.BootstrapDemoAsync(new BootstrapMonitoringDemoInput());
            var database = bootstrap.Servers
                .SelectMany(x => x.Databases)
                .First();

            var result = await _activityEventAppService.IngestAbpAuditLogsAsync(new IngestAbpAuditLogsInput
            {
                DatabaseId = database.Id,
                AbpAuditLogs = new List<AbpAuditLogIngestionItemDto>
                {
                    new AbpAuditLogIngestionItemDto
                    {
                        Id = 999,
                        TenantId = AbpSession.TenantId,
                        ServiceName = "Team2GroupProject.Controllers.TokenAuthController",
                        MethodName = "Authenticate",
                        Parameters = "{\"model\":{\"userNameOrEmailAddress\":\"admin\",\"password\":\"redacted-test-value\",\"rememberClient\":true}}",
                        ExecutionTime = DateTime.UtcNow,
                        ExecutionDuration = 4300,
                        ClientIpAddress = "::1",
                        BrowserInfo = "Mozilla/5.0"
                    }
                }
            });

            result.AcceptedCount.ShouldBe(1);
            result.RejectedCount.ShouldBe(0);

            var persisted = await UsingDbContextAsync(async context =>
                await context.ActivityEvents.FindAsync(result.CreatedEventIds.Single()));

            persisted.ShouldNotBeNull();
            persisted.DatabaseId.ShouldBe(database.Id);
            persisted.ServerId.ShouldBe(database.ServerId);
            persisted.ActorUser.ShouldBe("admin");
        }

        [Fact]
        public async Task BootstrapDemoAsync_should_seed_default_alert_rules_for_the_current_tenant()
        {
            await _monitoringInfrastructureAppService.BootstrapDemoAsync(new BootstrapMonitoringDemoInput());

            var persistedRules = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.AlertRules
                    .Where(x => x.TenantId == AbpSession.TenantId)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Name)
                    .ToList()));

            persistedRules.ShouldContain("Default: Failed login burst");
            persistedRules.ShouldContain("Default: Write spike");
            persistedRules.ShouldContain("Default: Large write operation");
            persistedRules.ShouldContain("Default: After-hours risky activity");
            persistedRules.ShouldContain("Default: Privileged action activity");
        }
    }
}
