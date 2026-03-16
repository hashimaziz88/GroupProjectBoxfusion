using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Services
{
    public class DemoActivityEventGenerator : IDemoActivityEventGenerator
    {
        private const int AnomalyEventCount = 24;

        private static readonly string[] DemoUsers =
        {
            "analyst.jade",
            "dba.nala",
            "ops.tariq",
            "svc.reporting",
            "etl.sync",
            "readonly.app"
        };

        private static readonly string[] DemoIps =
        {
            "10.10.1.14",
            "10.10.3.22",
            "10.10.4.18",
            "172.16.20.9",
            "172.16.21.11",
            "192.168.44.5"
        };

        public DemoActivityGenerationResult Generate(
            int tenantId,
            IReadOnlyCollection<MonitoredServer> servers,
            IReadOnlyCollection<MonitoredDatabase> databases,
            int eventCount,
            int seed,
            bool includeAnomalies)
        {
            var random = new Random(seed);
            var activeServers = servers.Where(server => server.IsActive).ToList();
            var activeDatabases = databases.Where(database => database.IsActive).ToList();
            var events = new List<ActivityEvent>();
            var scenarios = new List<string>();

            var baselineEventCount = includeAnomalies
                ? Math.Max(0, eventCount - AnomalyEventCount)
                : eventCount;

            for (var index = 0; index < baselineEventCount; index++)
            {
                events.Add(CreateBaselineEvent(tenantId, activeServers, activeDatabases, random));
            }

            if (includeAnomalies)
            {
                events.AddRange(CreateRepeatedFailedLoginScenario(tenantId, activeServers, activeDatabases));
                events.AddRange(CreateOutOfHoursPrivilegedScenario(tenantId, activeServers, activeDatabases));
                events.AddRange(CreateWriteSpikeScenario(tenantId, activeServers, activeDatabases));
                events.AddRange(CreateLargeReadScenario(tenantId, activeServers, activeDatabases));
                events.AddRange(CreateSuspiciousAccessScenario(tenantId, activeServers, activeDatabases));

                scenarios.Add("Repeated failed login attempts");
                scenarios.Add("Out-of-hours privileged activity");
                scenarios.Add("Excessive write spike");
                scenarios.Add("Large read event");
                scenarios.Add("Suspicious access pattern");
            }

            return new DemoActivityGenerationResult
            {
                Events = events.OrderBy(activityEvent => activityEvent.EventTime).ToList(),
                ScenarioNames = scenarios
            };
        }

        private static ActivityEvent CreateBaselineEvent(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases,
            Random random)
        {
            var database = databases[random.Next(databases.Count)];
            var server = servers.Single(activeServer => activeServer.Id == database.ServerId);
            var eventType = (ActivityEventType)random.Next(1, 5);
            var eventTime = DateTime.UtcNow
                .AddHours(-random.Next(2, 48))
                .AddMinutes(-random.Next(0, 59));

            var operation = eventType switch
            {
                ActivityEventType.Login => "LOGIN",
                ActivityEventType.DataRead => "SELECT",
                ActivityEventType.DataWrite => random.Next(0, 2) == 0 ? "UPDATE" : "INSERT",
                _ => "SELECT"
            };

            return new ActivityEvent
            {
                TenantId = tenantId,
                ServerId = server.Id,
                DatabaseId = database.Id,
                EventTime = eventTime,
                EventType = eventType,
                ActorUser = DemoUsers[random.Next(DemoUsers.Length)],
                ActorIp = DemoIps[random.Next(DemoIps.Length)],
                ObjectName = random.Next(0, 2) == 0 ? "transactions" : "accounts",
                Operation = operation,
                RowsAffected = eventType == ActivityEventType.DataRead
                    ? random.Next(10, 2000)
                    : random.Next(1, 150),
                DurationMs = random.Next(15, 850),
                IsSuccessful = random.Next(0, 100) > 8,
                IsPrivilegedAction = false,
                Severity = AlertSeverity.Informational,
                QuerySignature = $"{operation}_{database.Name.ToLowerInvariant()}",
                EvidenceJson = JsonSerializer.Serialize(new
                {
                    database = database.Name,
                    server = server.HostName,
                    source = "demo-generator"
                })
            };
        }

        private static IEnumerable<ActivityEvent> CreateRepeatedFailedLoginScenario(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases)
        {
            var database = databases.First(databaseItem => databaseItem.Name == "IdentityVault");
            var server = servers.Single(activeServer => activeServer.Id == database.ServerId);
            var start = DateTime.UtcNow.AddMinutes(-35);

            return Enumerable.Range(0, 6).Select(offset => new ActivityEvent
            {
                TenantId = tenantId,
                ServerId = server.Id,
                DatabaseId = database.Id,
                EventTime = start.AddMinutes(offset * 2),
                EventType = ActivityEventType.Login,
                ActorUser = "unknown.root",
                ActorIp = "203.0.113.45",
                ObjectName = "IdentityVault",
                Operation = "LOGIN",
                DurationMs = 80 + (offset * 10),
                IsSuccessful = false,
                Severity = AlertSeverity.Informational,
                FailureReason = "invalid_password",
                EvidenceJson = "{\"reason\":\"invalid_password\",\"source\":\"demo-generator\"}"
            });
        }

        private static IEnumerable<ActivityEvent> CreateOutOfHoursPrivilegedScenario(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases)
        {
            var database = databases.First(databaseItem => databaseItem.Name == "IdentityVault");
            var server = servers.Single(activeServer => activeServer.Id == database.ServerId);
            var eventTime = DateTime.UtcNow.Date.AddDays(-1).AddHours(2).AddMinutes(14);

            return new[]
            {
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = server.Id,
                    DatabaseId = database.Id,
                    EventTime = eventTime,
                    EventType = ActivityEventType.PrivilegedAction,
                    ActorUser = "dba.afterhours",
                    ActorIp = "198.51.100.12",
                    ObjectName = "role_membership",
                    Operation = "ALTER ROLE",
                    RowsAffected = 1,
                    DurationMs = 420,
                    IsSuccessful = true,
                    IsPrivilegedAction = true,
                    Severity = AlertSeverity.Informational,
                    EvidenceJson = "{\"change\":\"role_membership_update\",\"source\":\"demo-generator\"}"
                }
            };
        }

        private static IEnumerable<ActivityEvent> CreateWriteSpikeScenario(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases)
        {
            var database = databases.First(databaseItem => databaseItem.Name == "TenantLedger");
            var server = servers.Single(activeServer => activeServer.Id == database.ServerId);
            var start = DateTime.UtcNow.AddMinutes(-18);

            return Enumerable.Range(0, 12).Select(offset => new ActivityEvent
            {
                TenantId = tenantId,
                ServerId = server.Id,
                DatabaseId = database.Id,
                EventTime = start.AddMinutes(offset),
                EventType = ActivityEventType.DataWrite,
                ActorUser = "svc.reporting",
                ActorIp = "172.16.20.9",
                ObjectName = "transactions",
                Operation = offset % 2 == 0 ? "UPDATE" : "INSERT",
                RowsAffected = 250 + (offset * 5),
                DurationMs = 120 + (offset * 8),
                IsSuccessful = true,
                Severity = AlertSeverity.Informational,
                QuerySignature = "bulk_write_transactions",
                EvidenceJson = "{\"batch\":\"evening-close\",\"source\":\"demo-generator\"}"
            });
        }

        private static IEnumerable<ActivityEvent> CreateLargeReadScenario(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases)
        {
            var database = databases.First(databaseItem => databaseItem.Name == "AuditWarehouse");
            var server = servers.Single(activeServer => activeServer.Id == database.ServerId);

            return new[]
            {
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = server.Id,
                    DatabaseId = database.Id,
                    EventTime = DateTime.UtcNow.AddMinutes(-52),
                    EventType = ActivityEventType.DataRead,
                    ActorUser = "analyst.jade",
                    ActorIp = "10.10.4.18",
                    ObjectName = "audit_entries",
                    Operation = "SELECT",
                    RowsAffected = 12000,
                    DurationMs = 910,
                    IsSuccessful = true,
                    Severity = AlertSeverity.Informational,
                    QuerySignature = "select_audit_entries_mass_export",
                    EvidenceJson = "{\"export\":\"security-review\",\"source\":\"demo-generator\"}"
                }
            };
        }

        private static IEnumerable<ActivityEvent> CreateSuspiciousAccessScenario(
            int tenantId,
            IReadOnlyList<MonitoredServer> servers,
            IReadOnlyList<MonitoredDatabase> databases)
        {
            var primaryDatabase = databases.First(databaseItem => databaseItem.Name == "IdentityVault");
            var replicaDatabase = databases.First(databaseItem => databaseItem.Name == "AuditWarehouse");
            var primaryServer = servers.Single(activeServer => activeServer.Id == primaryDatabase.ServerId);
            var replicaServer = servers.Single(activeServer => activeServer.Id == replicaDatabase.ServerId);
            var start = DateTime.UtcNow.AddMinutes(-12);

            return new[]
            {
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = primaryServer.Id,
                    DatabaseId = primaryDatabase.Id,
                    EventTime = start,
                    EventType = ActivityEventType.Login,
                    ActorUser = "service.unknown",
                    ActorIp = "198.51.100.88",
                    ObjectName = "IdentityVault",
                    Operation = "LOGIN",
                    DurationMs = 60,
                    IsSuccessful = false,
                    Severity = AlertSeverity.Informational,
                    FailureReason = "locked_account"
                },
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = primaryServer.Id,
                    DatabaseId = primaryDatabase.Id,
                    EventTime = start.AddMinutes(2),
                    EventType = ActivityEventType.PermissionChange,
                    ActorUser = "service.unknown",
                    ActorIp = "198.51.100.88",
                    ObjectName = "user_permissions",
                    Operation = "GRANT",
                    RowsAffected = 1,
                    DurationMs = 180,
                    IsSuccessful = false,
                    Severity = AlertSeverity.Informational
                },
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = replicaServer.Id,
                    DatabaseId = replicaDatabase.Id,
                    EventTime = start.AddMinutes(4),
                    EventType = ActivityEventType.DataRead,
                    ActorUser = "service.unknown",
                    ActorIp = "198.51.100.88",
                    ObjectName = "audit_entries",
                    Operation = "SELECT",
                    RowsAffected = 3400,
                    DurationMs = 690,
                    IsSuccessful = true,
                    Severity = AlertSeverity.High
                },
                new ActivityEvent
                {
                    TenantId = tenantId,
                    ServerId = replicaServer.Id,
                    DatabaseId = replicaDatabase.Id,
                    EventTime = start.AddMinutes(6),
                    EventType = ActivityEventType.Query,
                    ActorUser = "service.unknown",
                    ActorIp = "198.51.100.88",
                    ObjectName = "billing_exports",
                    Operation = "SELECT",
                    RowsAffected = 1250,
                    DurationMs = 520,
                    IsSuccessful = false,
                    Severity = AlertSeverity.Informational,
                    FailureReason = "permission_denied"
                }
            };
        }
    }
}
