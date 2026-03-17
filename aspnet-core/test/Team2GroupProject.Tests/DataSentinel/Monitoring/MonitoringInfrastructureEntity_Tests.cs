using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Abp.Runtime.Session;
using Team2GroupProject.DataSentinel.Monitoring;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.Monitoring
{
    public class MonitoringInfrastructureEntity_Tests : Team2GroupProjectTestBase
    {
        private readonly IMonitoredServerRepository _monitoredServerRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;

        public MonitoringInfrastructureEntity_Tests()
        {
            _monitoredServerRepository = Resolve<IMonitoredServerRepository>();
            _monitoredTableRepository = Resolve<IMonitoredTableRepository>();
        }

        [Fact]
        public async Task Should_persist_monitored_server_with_related_database_and_table()
        {
            var tenantId = AbpSession.GetTenantId();
            var server = new MonitoredServer(
                tenantId,
                "Primary Operations Cluster",
                "pg-prod-01.boxfusion.local",
                "Production",
                "Primary database host for demo security monitoring.")
            {
                LastHeartbeatAt = DateTime.UtcNow
            };

            var database = new MonitoredDatabase(
                tenantId,
                server.Id,
                "OperationsLedger",
                "PostgreSQL",
                "Main operational datastore used in the DataSentinel demo.")
            {
                LastActivityAt = DateTime.UtcNow
            };

            var table = new MonitoredTable(
                tenantId,
                database.Id,
                "public",
                "security_alerts",
                "Primary alert evidence table for the DataSentinel demo.")
            {
                LastActivityAt = DateTime.UtcNow
            };

            database.Tables.Add(table);
            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            await UsingDbContextAsync(async context =>
            {
                var persistedServer = await context.MonitoredServers
                    .Include(x => x.Databases)
                        .ThenInclude(x => x.Tables)
                    .SingleAsync(x => x.Id == server.Id);

                persistedServer.TenantId.ShouldBe(tenantId);
                persistedServer.HostName.ShouldBe("pg-prod-01.boxfusion.local");
                persistedServer.Databases.Count.ShouldBe(1);
                persistedServer.Databases.Single().Name.ShouldBe("OperationsLedger");
                persistedServer.Databases.Single().Engine.ShouldBe("PostgreSQL");
                persistedServer.Databases.Single().Tables.Count.ShouldBe(1);
                persistedServer.Databases.Single().Tables.Single().SchemaName.ShouldBe("public");
                persistedServer.Databases.Single().Tables.Single().Name.ShouldBe("security_alerts");
            });
        }

        [MultiTenantFact]
        public async Task Should_persist_tenant_ownership_for_monitored_servers()
        {
            var tenantOneServer = new MonitoredServer(
                1,
                "Tenant One Cluster",
                "tenant-one.boxfusion.local",
                "Production",
                "Tenant one database server.");

            var tenantTwoServer = new MonitoredServer(
                2,
                "Tenant Two Cluster",
                "tenant-two.boxfusion.local",
                "Staging",
                "Tenant two database server.");

            await UsingDbContextAsync(1, async context =>
            {
                await context.MonitoredServers.AddAsync(tenantOneServer);
            });

            await UsingDbContextAsync(2, async context =>
            {
                await context.MonitoredServers.AddAsync(tenantTwoServer);
            });

            await UsingDbContextAsync(async context =>
            {
                var visibleServerNames = await context.MonitoredServers
                    .Where(x => x.TenantId == 1)
                    .OrderBy(x => x.Name)
                    .Select(x => x.Name)
                    .ToListAsync();

                visibleServerNames.ShouldContain("Tenant One Cluster");
                visibleServerNames.ShouldNotContain("Tenant Two Cluster");
            });
        }

        [Fact]
        public async Task Should_resolve_monitoring_hierarchy_through_repositories()
        {
            var tenantId = AbpSession.GetTenantId();
            var server = new MonitoredServer(
                tenantId,
                "Demo Cluster",
                "pg-demo-01.boxfusion.local",
                "Demo",
                "Repository hierarchy verification server.");

            var database = new MonitoredDatabase(
                tenantId,
                server.Id,
                "AuditWarehouse",
                "PostgreSQL",
                "Repository hierarchy verification database.");

            var firstTable = new MonitoredTable(
                tenantId,
                database.Id,
                "audit",
                "activity_events",
                "Stores ingested activity events.");

            var secondTable = new MonitoredTable(
                tenantId,
                database.Id,
                "security",
                "alerts",
                "Stores generated security alerts.");

            database.Tables.Add(firstTable);
            database.Tables.Add(secondTable);
            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            var resolvedServer = await _monitoredServerRepository.GetWithHierarchyAsync(server.Id);
            resolvedServer.ShouldNotBeNull();
            resolvedServer.Databases.Count.ShouldBe(1);
            resolvedServer.Databases.Single().Tables.Count.ShouldBe(2);

            var resolvedTables = await _monitoredTableRepository.GetByDatabaseIdAsync(database.Id);
            resolvedTables.Count.ShouldBe(2);
            resolvedTables.Select(x => x.Name).ShouldContain("activity_events");
            resolvedTables.Select(x => x.Name).ShouldContain("alerts");
        }
    }
}
