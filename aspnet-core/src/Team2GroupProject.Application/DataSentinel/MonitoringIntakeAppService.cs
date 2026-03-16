using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;
using Team2GroupProject.DataSentinel.Services;

namespace Team2GroupProject.DataSentinel
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Intake)]
    public class MonitoringIntakeAppService : Team2GroupProjectAppServiceBase, IMonitoringIntakeAppService
    {
        private readonly IRepository<ActivityEvent, long> _activityEventRepository;
        private readonly IRepository<AlertRule, long> _alertRuleRepository;
        private readonly IRepository<SecurityAlert, long> _securityAlertRepository;
        private readonly IRepository<MonitoredServer, long> _monitoredServerRepository;
        private readonly IRepository<MonitoredDatabase, long> _monitoredDatabaseRepository;
        private readonly IActivityEventNormalizationManager _normalizationManager;
        private readonly IAlertRuleEvaluator _alertRuleEvaluator;
        private readonly IAlertPriorityCalculator _alertPriorityCalculator;
        private readonly IDemoActivityEventGenerator _demoActivityEventGenerator;

        public MonitoringIntakeAppService(
            IRepository<ActivityEvent, long> activityEventRepository,
            IRepository<AlertRule, long> alertRuleRepository,
            IRepository<SecurityAlert, long> securityAlertRepository,
            IRepository<MonitoredServer, long> monitoredServerRepository,
            IRepository<MonitoredDatabase, long> monitoredDatabaseRepository,
            IActivityEventNormalizationManager normalizationManager,
            IAlertRuleEvaluator alertRuleEvaluator,
            IAlertPriorityCalculator alertPriorityCalculator,
            IDemoActivityEventGenerator demoActivityEventGenerator)
        {
            _activityEventRepository = activityEventRepository;
            _alertRuleRepository = alertRuleRepository;
            _securityAlertRepository = securityAlertRepository;
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _normalizationManager = normalizationManager;
            _alertRuleEvaluator = alertRuleEvaluator;
            _alertPriorityCalculator = alertPriorityCalculator;
            _demoActivityEventGenerator = demoActivityEventGenerator;
        }

        public async Task<MonitoringIntakeResultDto> GenerateDemoDataAsync(GenerateDemoActivityInput input)
        {
            var tenantId = AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel intake requires an active tenant context.");
            await EnsureDefaultMonitoringAssetsAsync(tenantId);

            var servers = await _monitoredServerRepository.GetAllListAsync(server => server.TenantId == tenantId && server.IsActive);
            var databases = await _monitoredDatabaseRepository.GetAllListAsync(database => database.TenantId == tenantId && database.IsActive);
            var generationResult = _demoActivityEventGenerator.Generate(tenantId, servers, databases, input.EventCount, input.Seed, input.IncludeAnomalies);

            var createdEvents = await PersistActivityEventsAsync(generationResult.Events);
            var createdAlerts = input.RunDetection
                ? await RunDetectionAsync(tenantId, createdEvents.Select(activityEvent => activityEvent.Id).ToList())
                : new List<SecurityAlert>();

            return new MonitoringIntakeResultDto
            {
                CreatedEventCount = createdEvents.Count,
                CreatedAlertCount = createdAlerts.Count,
                CreatedAlertIds = createdAlerts.Select(alert => alert.Id).ToList(),
                ScenarioNames = generationResult.ScenarioNames
            };
        }

        public async Task<MonitoringIntakeResultDto> ImportActivityEventsAsync(ImportActivityEventsInput input)
        {
            var tenantId = AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel intake requires an active tenant context.");
            await EnsureDefaultMonitoringAssetsAsync(tenantId);

            var importItems = DeserializeImportItems(input.PayloadJson);
            var createdEvents = new List<ActivityEvent>();

            foreach (var importItem in importItems)
            {
                ValidateImportItem(importItem);

                var server = await ResolveServerAsync(tenantId, importItem);
                var database = await ResolveDatabaseAsync(tenantId, server, importItem);
                var activityEvent = _normalizationManager.Normalize(new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = server.Id,
                    DatabaseId = database.Id,
                    EventTime = importItem.EventTime,
                    EventType = importItem.EventType,
                    ActorUser = importItem.ActorUser,
                    ActorIp = importItem.ActorIp,
                    ObjectName = importItem.ObjectName,
                    Operation = importItem.Operation,
                    RowsAffected = importItem.RowsAffected,
                    DurationMs = importItem.DurationMs,
                    IsSuccessful = importItem.IsSuccessful ?? true,
                    IsPrivilegedAction = importItem.IsPrivilegedAction ?? false,
                    Severity = importItem.Severity ?? AlertSeverity.Informational,
                    QuerySignature = importItem.QuerySignature,
                    FailureReason = importItem.FailureReason,
                    EvidenceJson = importItem.EvidenceJson
                });

                createdEvents.Add(await _activityEventRepository.InsertAsync(activityEvent));
            }

            await CurrentUnitOfWork.SaveChangesAsync();

            var createdAlerts = input.RunDetection
                ? await RunDetectionAsync(tenantId, createdEvents.Select(activityEvent => activityEvent.Id).ToList())
                : new List<SecurityAlert>();

            return new MonitoringIntakeResultDto
            {
                CreatedEventCount = createdEvents.Count,
                CreatedAlertCount = createdAlerts.Count,
                CreatedAlertIds = createdAlerts.Select(alert => alert.Id).ToList(),
                ScenarioNames = Array.Empty<string>()
            };
        }

        public async Task<ListResultDto<MonitoredServerLookupDto>> GetMonitoredServersAsync()
        {
            var tenantId = AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel monitoring assets require an active tenant context.");
            var servers = await _monitoredServerRepository.GetAll()
                .Where(server => server.TenantId == tenantId)
                .OrderBy(server => server.Name)
                .Select(server => new MonitoredServerLookupDto
                {
                    Id = server.Id,
                    Name = server.Name,
                    HostName = server.HostName,
                    EnvironmentName = server.EnvironmentName,
                    Region = server.Region,
                    Description = server.Description,
                    IsActive = server.IsActive
                })
                .ToListAsync();

            return new ListResultDto<MonitoredServerLookupDto>(servers);
        }

        public async Task<ListResultDto<MonitoredDatabaseLookupDto>> GetMonitoredDatabasesAsync()
        {
            var tenantId = AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel monitoring assets require an active tenant context.");
            var databases = await _monitoredDatabaseRepository.GetAll()
                .Where(database => database.TenantId == tenantId)
                .OrderBy(database => database.Name)
                .Select(database => new MonitoredDatabaseLookupDto
                {
                    Id = database.Id,
                    ServerId = database.ServerId,
                    ServerName = database.Server.Name,
                    Name = database.Name,
                    Engine = database.Engine,
                    Owner = database.Owner,
                    Description = database.Description,
                    IsActive = database.IsActive
                })
                .ToListAsync();

            return new ListResultDto<MonitoredDatabaseLookupDto>(databases);
        }

        private async Task EnsureDefaultMonitoringAssetsAsync(int tenantId)
        {
            foreach (var serverDefinition in DataSentinelDefaults.GetServerDefinitions())
            {
                var existingServer = await _monitoredServerRepository.GetAll()
                    .FirstOrDefaultAsync(server => server.TenantId == tenantId && server.Name == serverDefinition.Name);

                if (existingServer != null)
                {
                    continue;
                }

                await _monitoredServerRepository.InsertAsync(new MonitoredServer
                {
                    TenantId = tenantId,
                    Name = serverDefinition.Name,
                    HostName = serverDefinition.HostName,
                    EnvironmentName = serverDefinition.EnvironmentName,
                    Region = serverDefinition.Region,
                    Description = serverDefinition.Description,
                    IsActive = true
                });
            }

            await CurrentUnitOfWork.SaveChangesAsync();

            foreach (var databaseDefinition in DataSentinelDefaults.GetDatabaseDefinitions())
            {
                var server = await _monitoredServerRepository.GetAll()
                    .SingleAsync(monitoredServer => monitoredServer.TenantId == tenantId && monitoredServer.Name == databaseDefinition.ServerName);

                var existingDatabase = await _monitoredDatabaseRepository.GetAll()
                    .FirstOrDefaultAsync(database =>
                        database.TenantId == tenantId &&
                        database.ServerId == server.Id &&
                        database.Name == databaseDefinition.Name);

                if (existingDatabase != null)
                {
                    continue;
                }

                await _monitoredDatabaseRepository.InsertAsync(new MonitoredDatabase
                {
                    TenantId = tenantId,
                    ServerId = server.Id,
                    Name = databaseDefinition.Name,
                    Engine = databaseDefinition.Engine,
                    Owner = databaseDefinition.Owner,
                    Description = databaseDefinition.Description,
                    IsActive = true
                });
            }

            foreach (var ruleDefinition in DataSentinelDefaults.GetRuleDefinitions())
            {
                var existingRule = await _alertRuleRepository.GetAll()
                    .FirstOrDefaultAsync(rule => rule.TenantId == tenantId && rule.Name == ruleDefinition.Name);

                if (existingRule != null)
                {
                    continue;
                }

                await _alertRuleRepository.InsertAsync(new AlertRule
                {
                    TenantId = tenantId,
                    Name = ruleDefinition.Name,
                    Description = ruleDefinition.Description,
                    IsEnabled = true,
                    RuleType = ruleDefinition.RuleType,
                    EventType = ruleDefinition.EventType,
                    WindowMinutes = ruleDefinition.WindowMinutes,
                    ThresholdCount = ruleDefinition.ThresholdCount,
                    GroupByField = ruleDefinition.GroupByField,
                    Severity = ruleDefinition.Severity
                });
            }

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        private async Task<List<ActivityEvent>> PersistActivityEventsAsync(IEnumerable<ActivityEvent> events)
        {
            var createdEvents = new List<ActivityEvent>();

            foreach (var activityEvent in events.Select(_normalizationManager.Normalize))
            {
                createdEvents.Add(await _activityEventRepository.InsertAsync(activityEvent));
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            return createdEvents;
        }

        private async Task<List<SecurityAlert>> RunDetectionAsync(int tenantId, IReadOnlyCollection<long> focusEventIds)
        {
            if (focusEventIds.Count == 0)
            {
                return new List<SecurityAlert>();
            }

            var focusEvents = await _activityEventRepository.GetAll()
                .Where(activityEvent => activityEvent.TenantId == tenantId && focusEventIds.Contains(activityEvent.Id))
                .ToListAsync();

            if (focusEvents.Count == 0)
            {
                return new List<SecurityAlert>();
            }

            var rules = await _alertRuleRepository.GetAll()
                .Where(rule => rule.TenantId == tenantId && rule.IsEnabled)
                .ToListAsync();

            if (rules.Count == 0)
            {
                return new List<SecurityAlert>();
            }

            var maxWindowMinutes = Math.Max(rules.Max(rule => rule.WindowMinutes), 60);
            var earliestEventTime = focusEvents.Min(activityEvent => activityEvent.EventTime).AddMinutes(-maxWindowMinutes);
            var latestEventTime = focusEvents.Max(activityEvent => activityEvent.EventTime).AddMinutes(maxWindowMinutes);

            var recentEvents = await _activityEventRepository.GetAll()
                .Where(activityEvent =>
                    activityEvent.TenantId == tenantId &&
                    activityEvent.EventTime >= earliestEventTime &&
                    activityEvent.EventTime <= latestEventTime)
                .ToListAsync();

            var candidates = _alertRuleEvaluator.Evaluate(rules, recentEvents, focusEventIds).ToList();
            _alertPriorityCalculator.ApplyPriorityRules(candidates);

            var createdAlerts = new List<SecurityAlert>();
            foreach (var candidate in candidates)
            {
                var existingAlerts = await _securityAlertRepository.GetAll()
                    .Where(alert =>
                        alert.TenantId == tenantId &&
                        alert.RuleId == candidate.RuleId &&
                        alert.PrimaryActorUser == candidate.PrimaryActorUser &&
                        alert.PrimaryActorIp == candidate.PrimaryActorIp &&
                        alert.EventTimeStart <= candidate.EventTimeEnd &&
                        alert.EventTimeEnd >= candidate.EventTimeStart)
                    .ToListAsync();

                var alreadyExists = existingAlerts.Any(alert =>
                    alert.EventTimeStart == candidate.EventTimeStart &&
                    alert.EventTimeEnd == candidate.EventTimeEnd);

                if (alreadyExists)
                {
                    continue;
                }

                createdAlerts.Add(await _securityAlertRepository.InsertAsync(new SecurityAlert
                {
                    TenantId = tenantId,
                    RuleId = candidate.RuleId,
                    Status = SecurityAlertStatus.Unreviewed,
                    Severity = candidate.Severity,
                    Title = candidate.Title,
                    Summary = candidate.Summary,
                    PrimaryActorUser = candidate.PrimaryActorUser,
                    PrimaryActorIp = candidate.PrimaryActorIp,
                    EventTimeStart = candidate.EventTimeStart,
                    EventTimeEnd = candidate.EventTimeEnd,
                    RelatedEventCount = candidate.RelatedEventCount,
                    TopEvidenceJson = candidate.TopEvidenceJson
                }));
            }

            await CurrentUnitOfWork.SaveChangesAsync();
            return createdAlerts;
        }

        private static List<ActivityEventImportItemDto> DeserializeImportItems(string payloadJson)
        {
            try
            {
                var importItems = JsonSerializer.Deserialize<List<ActivityEventImportItemDto>>(payloadJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (importItems == null || importItems.Count == 0)
                {
                    throw new UserFriendlyException("No activity events were supplied for import.");
                }

                return importItems;
            }
            catch (JsonException exception)
            {
                throw new UserFriendlyException($"The activity event payload could not be parsed: {exception.Message}");
            }
        }

        private static void ValidateImportItem(ActivityEventImportItemDto importItem)
        {
            if (importItem.EventTime == default)
            {
                throw new UserFriendlyException("Imported activity events must include an eventTime value.");
            }

            if (importItem.ServerId == null && string.IsNullOrWhiteSpace(importItem.ServerName))
            {
                throw new UserFriendlyException("Each imported activity event must include either serverId or serverName.");
            }

            if (importItem.DatabaseId == null && string.IsNullOrWhiteSpace(importItem.DatabaseName))
            {
                throw new UserFriendlyException("Each imported activity event must include either databaseId or databaseName.");
            }
        }

        private async Task<MonitoredServer> ResolveServerAsync(int tenantId, ActivityEventImportItemDto importItem)
        {
            if (importItem.ServerId.HasValue)
            {
                var existingServer = await _monitoredServerRepository.FirstOrDefaultAsync(importItem.ServerId.Value);
                if (existingServer == null || existingServer.TenantId != tenantId)
                {
                    throw new UserFriendlyException($"Server {importItem.ServerId.Value} is not available in the current tenant.");
                }

                return existingServer;
            }

            var serverName = importItem.ServerName.Trim();
            var server = await _monitoredServerRepository.GetAll()
                .FirstOrDefaultAsync(existingServer => existingServer.TenantId == tenantId && existingServer.Name == serverName);

            if (server != null)
            {
                return server;
            }

            server = await _monitoredServerRepository.InsertAsync(new MonitoredServer
            {
                TenantId = tenantId,
                Name = serverName,
                HostName = string.IsNullOrWhiteSpace(importItem.HostName)
                    ? $"{serverName.ToLowerInvariant().Replace(' ', '-')}.boxfusion.local"
                    : importItem.HostName.Trim(),
                EnvironmentName = "Imported",
                Description = "Created automatically from imported monitoring activity.",
                IsActive = true
            });

            await CurrentUnitOfWork.SaveChangesAsync();
            return server;
        }

        private async Task<MonitoredDatabase> ResolveDatabaseAsync(int tenantId, MonitoredServer server, ActivityEventImportItemDto importItem)
        {
            if (importItem.DatabaseId.HasValue)
            {
                var existingDatabase = await _monitoredDatabaseRepository.FirstOrDefaultAsync(importItem.DatabaseId.Value);
                if (existingDatabase == null || existingDatabase.TenantId != tenantId)
                {
                    throw new UserFriendlyException($"Database {importItem.DatabaseId.Value} is not available in the current tenant.");
                }

                return existingDatabase;
            }

            var databaseName = importItem.DatabaseName.Trim();
            var database = await _monitoredDatabaseRepository.GetAll()
                .FirstOrDefaultAsync(existingDatabase =>
                    existingDatabase.TenantId == tenantId &&
                    existingDatabase.ServerId == server.Id &&
                    existingDatabase.Name == databaseName);

            if (database != null)
            {
                return database;
            }

            database = await _monitoredDatabaseRepository.InsertAsync(new MonitoredDatabase
            {
                TenantId = tenantId,
                ServerId = server.Id,
                Name = databaseName,
                Engine = string.IsNullOrWhiteSpace(importItem.DatabaseEngine) ? "PostgreSQL" : importItem.DatabaseEngine.Trim(),
                Owner = "imported-source",
                Description = "Created automatically from imported monitoring activity.",
                IsActive = true
            });

            await CurrentUnitOfWork.SaveChangesAsync();
            return database;
        }
    }
}
