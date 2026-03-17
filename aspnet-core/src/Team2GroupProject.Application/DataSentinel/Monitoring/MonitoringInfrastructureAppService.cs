using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Monitoring.Dto;

namespace Team2GroupProject.DataSentinel.Monitoring
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Infrastructure_View)]
    public class MonitoringInfrastructureAppService : Team2GroupProjectAppServiceBase, IMonitoringInfrastructureAppService
    {
        private readonly IMonitoredServerRepository _monitoredServerRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;

        public MonitoringInfrastructureAppService(
            IMonitoredServerRepository monitoredServerRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IMonitoredTableRepository monitoredTableRepository)
        {
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _monitoredTableRepository = monitoredTableRepository;
        }

        public async Task<ListResultDto<MonitoredServerDto>> GetMonitoredServersAsync()
        {
            var servers = await LoadInfrastructureAsync(AbpSession.GetTenantId());

            return new ListResultDto<MonitoredServerDto>(servers.Select(MapServer).ToList());
        }

        public async Task<ListResultDto<MonitoredDatabaseDto>> GetMonitoredDatabasesAsync(GetMonitoredDatabasesInput input)
        {
            var tenantId = AbpSession.GetTenantId();

            if (input?.ServerId.HasValue == true)
            {
                await GetTenantServerAsync(tenantId, input.ServerId.Value);
            }

            var databases = await _monitoredDatabaseRepository.GetAllIncluding(x => x.Tables)
                .Where(x => x.TenantId == tenantId)
                .WhereIf(input?.ServerId.HasValue == true, x => x.ServerId == input.ServerId.Value)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return new ListResultDto<MonitoredDatabaseDto>(databases.Select(MapDatabase).ToList());
        }

        public async Task<ListResultDto<MonitoredTableDto>> GetMonitoredTablesAsync(GetMonitoredTablesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            await GetTenantDatabaseAsync(tenantId, input.DatabaseId);

            var tables = await _monitoredTableRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.DatabaseId == input.DatabaseId)
                .OrderBy(x => x.SchemaName)
                .ThenBy(x => x.Name)
                .ToListAsync();

            return new ListResultDto<MonitoredTableDto>(tables.Select(MapTable).ToList());
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Infrastructure_Manage)]
        public async Task<MonitoredServerDto> CreateMonitoredServerAsync(CreateMonitoredServerInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var normalizedName = input.Name.Trim();
            var normalizedHostName = input.HostName.Trim();
            var normalizedEnvironment = input.Environment.Trim();

            var duplicateExists = await _monitoredServerRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId &&
                               (x.Name.ToLower() == normalizedName.ToLower() ||
                                x.HostName.ToLower() == normalizedHostName.ToLower()));

            if (duplicateExists)
            {
                throw new UserFriendlyException("A monitored server with the same name or host name already exists for this tenant.");
            }

            var server = new MonitoredServer(
                tenantId,
                normalizedName,
                normalizedHostName,
                normalizedEnvironment,
                input.Description,
                input.IsEnabled);

            await _monitoredServerRepository.InsertAsync(server);
            CurrentUnitOfWork.SaveChanges();

            return MapServer(server);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Infrastructure_Manage)]
        public async Task<MonitoredDatabaseDto> CreateMonitoredDatabaseAsync(CreateMonitoredDatabaseInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            await GetTenantServerAsync(tenantId, input.ServerId);

            var normalizedName = input.Name.Trim();
            var normalizedEngine = input.Engine.Trim();

            var duplicateExists = await _monitoredDatabaseRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId &&
                               x.ServerId == input.ServerId &&
                               x.Name.ToLower() == normalizedName.ToLower());

            if (duplicateExists)
            {
                throw new UserFriendlyException("A monitored database with the same name already exists on this server for the current tenant.");
            }

            var database = new MonitoredDatabase(
                tenantId,
                input.ServerId,
                normalizedName,
                normalizedEngine,
                input.Description,
                input.IsEnabled);

            await _monitoredDatabaseRepository.InsertAsync(database);
            CurrentUnitOfWork.SaveChanges();

            return MapDatabase(database);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Infrastructure_Manage)]
        public async Task<MonitoredTableDto> CreateMonitoredTableAsync(CreateMonitoredTableInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            await GetTenantDatabaseAsync(tenantId, input.DatabaseId);

            var normalizedSchemaName = input.SchemaName.Trim();
            var normalizedName = input.Name.Trim();

            var duplicateExists = await _monitoredTableRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId &&
                               x.DatabaseId == input.DatabaseId &&
                               x.SchemaName.ToLower() == normalizedSchemaName.ToLower() &&
                               x.Name.ToLower() == normalizedName.ToLower());

            if (duplicateExists)
            {
                throw new UserFriendlyException("A monitored table with the same schema and name already exists for this database.");
            }

            var table = new MonitoredTable(
                tenantId,
                input.DatabaseId,
                normalizedSchemaName,
                normalizedName,
                input.Description,
                input.IsEnabled);

            await _monitoredTableRepository.InsertAsync(table);
            CurrentUnitOfWork.SaveChanges();

            return MapTable(table);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Infrastructure_Manage)]
        public async Task<BootstrapMonitoringDemoResultDto> BootstrapDemoAsync(BootstrapMonitoringDemoInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var hostName = input.HostName.IsNullOrWhiteSpace()
                ? $"tenant-{tenantId}-pg-demo-01"
                : input.HostName.Trim();
            var serverName = input.ServerName.IsNullOrWhiteSpace()
                ? "Demo PostgreSQL Cluster"
                : input.ServerName.Trim();
            var environment = input.Environment.IsNullOrWhiteSpace()
                ? "Demo"
                : input.Environment.Trim();

            var createdServers = 0;
            var createdDatabases = 0;
            var createdTables = 0;

            var server = await _monitoredServerRepository.GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.HostName.ToLower() == hostName.ToLower());

            if (server == null)
            {
                server = new MonitoredServer(
                    tenantId,
                    serverName,
                    hostName,
                    environment,
                    "Seeded monitoring infrastructure for DataSentinel activity ingestion demos.");

                await _monitoredServerRepository.InsertAsync(server);
                createdServers++;
            }

            foreach (var databaseSeed in BuildDatabaseSeeds())
            {
                var database = await _monitoredDatabaseRepository.GetAll()
                    .FirstOrDefaultAsync(x => x.TenantId == tenantId &&
                                              x.ServerId == server.Id &&
                                              x.Name.ToLower() == databaseSeed.Name.ToLower());

                if (database == null)
                {
                    database = new MonitoredDatabase(
                        tenantId,
                        server.Id,
                        databaseSeed.Name,
                        databaseSeed.Engine,
                        databaseSeed.Description);

                    await _monitoredDatabaseRepository.InsertAsync(database);
                    createdDatabases++;
                }

                if (!input.IncludeTables)
                {
                    continue;
                }

                foreach (var tableSeed in databaseSeed.Tables)
                {
                    var tableExists = await _monitoredTableRepository.GetAll()
                        .AnyAsync(x => x.TenantId == tenantId &&
                                       x.DatabaseId == database.Id &&
                                       x.SchemaName.ToLower() == tableSeed.SchemaName.ToLower() &&
                                       x.Name.ToLower() == tableSeed.Name.ToLower());

                    if (tableExists)
                    {
                        continue;
                    }

                    var table = new MonitoredTable(
                        tenantId,
                        database.Id,
                        tableSeed.SchemaName,
                        tableSeed.Name,
                        tableSeed.Description);

                    await _monitoredTableRepository.InsertAsync(table);
                    createdTables++;
                }
            }

            CurrentUnitOfWork.SaveChanges();

            var servers = await LoadInfrastructureAsync(tenantId);

            return new BootstrapMonitoringDemoResultDto
            {
                CreatedServersCount = createdServers,
                CreatedDatabasesCount = createdDatabases,
                CreatedTablesCount = createdTables,
                Servers = servers.Select(MapServer).ToList()
            };
        }

        private async Task<List<MonitoredServer>> LoadInfrastructureAsync(int tenantId)
        {
            return await _monitoredServerRepository.GetAllIncluding(x => x.Databases)
                .Include(x => x.Databases)
                    .ThenInclude(x => x.Tables)
                .Where(x => x.TenantId == tenantId)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        private async Task<MonitoredServer> GetTenantServerAsync(int tenantId, Guid serverId)
        {
            var server = await _monitoredServerRepository.FirstOrDefaultAsync(x => x.Id == serverId && x.TenantId == tenantId);
            if (server == null)
            {
                throw new UserFriendlyException("ServerId does not reference a monitored server for this tenant.");
            }

            return server;
        }

        private async Task<MonitoredDatabase> GetTenantDatabaseAsync(int tenantId, Guid databaseId)
        {
            var database = await _monitoredDatabaseRepository.FirstOrDefaultAsync(x => x.Id == databaseId && x.TenantId == tenantId);
            if (database == null)
            {
                throw new UserFriendlyException("DatabaseId does not reference a monitored database for this tenant.");
            }

            return database;
        }

        private static MonitoredServerDto MapServer(MonitoredServer server)
        {
            return new MonitoredServerDto
            {
                Id = server.Id,
                Name = server.Name,
                HostName = server.HostName,
                Environment = server.Environment,
                Description = server.Description,
                IsEnabled = server.IsEnabled,
                LastHeartbeatAt = server.LastHeartbeatAt,
                Databases = server.Databases?
                    .OrderBy(x => x.Name)
                    .Select(MapDatabase)
                    .ToList() ?? new List<MonitoredDatabaseDto>()
            };
        }

        private static MonitoredDatabaseDto MapDatabase(MonitoredDatabase database)
        {
            return new MonitoredDatabaseDto
            {
                Id = database.Id,
                ServerId = database.ServerId,
                Name = database.Name,
                Engine = database.Engine,
                Description = database.Description,
                IsEnabled = database.IsEnabled,
                LastActivityAt = database.LastActivityAt,
                Tables = database.Tables?
                    .OrderBy(x => x.SchemaName)
                    .ThenBy(x => x.Name)
                    .Select(MapTable)
                    .ToList() ?? new List<MonitoredTableDto>()
            };
        }

        private static MonitoredTableDto MapTable(MonitoredTable table)
        {
            return new MonitoredTableDto
            {
                Id = table.Id,
                DatabaseId = table.DatabaseId,
                SchemaName = table.SchemaName,
                Name = table.Name,
                Description = table.Description,
                IsEnabled = table.IsEnabled,
                LastActivityAt = table.LastActivityAt
            };
        }

        private static IReadOnlyList<DatabaseSeedDefinition> BuildDatabaseSeeds()
        {
            return new[]
            {
                new DatabaseSeedDefinition(
                    "BoxfusionCore",
                    "PostgreSQL",
                    "Primary application workload for simulated ABP audit activity.",
                    new[]
                    {
                        new TableSeedDefinition("public", "abp_users", "Tenant user accounts referenced by simulated ABP activity."),
                        new TableSeedDefinition("public", "abp_roles", "Tenant role metadata referenced by permission changes."),
                        new TableSeedDefinition("audit", "abp_audit_logs", "ABP audit log records used for simulation uploads.")
                    }),
                new DatabaseSeedDefinition(
                    "BoxfusionAudit",
                    "PostgreSQL",
                    "Secondary audit-oriented workload for security monitoring demos.",
                    new[]
                    {
                        new TableSeedDefinition("audit", "abp_audit_logs", "Imported or simulated ABP audit log source records."),
                        new TableSeedDefinition("audit", "activity_events", "Normalized DataSentinel activity events."),
                        new TableSeedDefinition("security", "alerts", "Generated security alerts and investigation state.")
                    })
            };
        }

        private sealed class DatabaseSeedDefinition
        {
            public DatabaseSeedDefinition(
                string name,
                string engine,
                string description,
                IReadOnlyList<TableSeedDefinition> tables)
            {
                Name = name;
                Engine = engine;
                Description = description;
                Tables = tables;
            }

            public string Name { get; }

            public string Engine { get; }

            public string Description { get; }

            public IReadOnlyList<TableSeedDefinition> Tables { get; }
        }

        private sealed class TableSeedDefinition
        {
            public TableSeedDefinition(string schemaName, string name, string description)
            {
                SchemaName = schemaName;
                Name = name;
                Description = description;
            }

            public string SchemaName { get; }

            public string Name { get; }

            public string Description { get; }
        }
    }
}
