using System.Collections.Generic;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    public static class DataSentinelDefaults
    {
        public static IReadOnlyCollection<MonitoredServerSeedDefinition> GetServerDefinitions()
        {
            return new[]
            {
                new MonitoredServerSeedDefinition
                {
                    Name = "Primary PostgreSQL Cluster",
                    HostName = "pg-primary.boxfusion.local",
                    EnvironmentName = "Production",
                    Region = "Johannesburg",
                    Description = "Primary tenant workload cluster for operational PostgreSQL traffic."
                },
                new MonitoredServerSeedDefinition
                {
                    Name = "Analytics Read Replica",
                    HostName = "pg-analytics.boxfusion.local",
                    EnvironmentName = "Analytics",
                    Region = "Cape Town",
                    Description = "Read-heavy reporting replica used for dashboards and exports."
                }
            };
        }

        public static IReadOnlyCollection<MonitoredDatabaseSeedDefinition> GetDatabaseDefinitions()
        {
            return new[]
            {
                new MonitoredDatabaseSeedDefinition
                {
                    ServerName = "Primary PostgreSQL Cluster",
                    Name = "TenantLedger",
                    Engine = "PostgreSQL",
                    Owner = "finance-app",
                    Description = "Primary ledger and transaction database."
                },
                new MonitoredDatabaseSeedDefinition
                {
                    ServerName = "Primary PostgreSQL Cluster",
                    Name = "IdentityVault",
                    Engine = "PostgreSQL",
                    Owner = "identity-service",
                    Description = "Authentication, role, and access metadata."
                },
                new MonitoredDatabaseSeedDefinition
                {
                    ServerName = "Analytics Read Replica",
                    Name = "AuditWarehouse",
                    Engine = "PostgreSQL",
                    Owner = "reporting-service",
                    Description = "Reporting replica for audit and security analysis."
                }
            };
        }

        public static IReadOnlyCollection<AlertRuleSeedDefinition> GetRuleDefinitions()
        {
            return new[]
            {
                new AlertRuleSeedDefinition
                {
                    Name = "Repeated Failed Logins",
                    Description = "Triggers when repeated failed login activity occurs within a short interval for the same actor.",
                    RuleType = AlertRuleType.RepeatedFailedLogins,
                    EventType = ActivityEventType.Login,
                    WindowMinutes = 15,
                    ThresholdCount = 5,
                    GroupByField = "ActorUser",
                    Severity = AlertSeverity.High
                },
                new AlertRuleSeedDefinition
                {
                    Name = "Out-of-Hours Privileged Action",
                    Description = "Triggers when a privileged or permission-sensitive action occurs outside standard working hours.",
                    RuleType = AlertRuleType.OutOfHoursPrivilegedAction,
                    EventType = ActivityEventType.PrivilegedAction,
                    WindowMinutes = 60,
                    ThresholdCount = 1,
                    GroupByField = "ActorUser",
                    Severity = AlertSeverity.Critical
                },
                new AlertRuleSeedDefinition
                {
                    Name = "Excessive Write Spike",
                    Description = "Triggers when write-heavy activity spikes above the configured threshold for the same actor.",
                    RuleType = AlertRuleType.ExcessiveWriteSpike,
                    EventType = ActivityEventType.DataWrite,
                    WindowMinutes = 10,
                    ThresholdCount = 12,
                    GroupByField = "ActorUser",
                    Severity = AlertSeverity.High
                },
                new AlertRuleSeedDefinition
                {
                    Name = "Large Read Event",
                    Description = "Triggers when a single read activity affects an unusually high number of rows.",
                    RuleType = AlertRuleType.LargeRead,
                    EventType = ActivityEventType.DataRead,
                    WindowMinutes = 60,
                    ThresholdCount = 5000,
                    GroupByField = "ObjectName",
                    Severity = AlertSeverity.Medium
                },
                new AlertRuleSeedDefinition
                {
                    Name = "Suspicious Access Pattern",
                    Description = "Triggers when the same IP address repeatedly performs failed or risky access attempts.",
                    RuleType = AlertRuleType.SuspiciousAccessPattern,
                    EventType = null,
                    WindowMinutes = 20,
                    ThresholdCount = 4,
                    GroupByField = "ActorIp",
                    Severity = AlertSeverity.Medium
                }
            };
        }
    }

    public class MonitoredServerSeedDefinition
    {
        public string Name { get; set; }

        public string HostName { get; set; }

        public string EnvironmentName { get; set; }

        public string Region { get; set; }

        public string Description { get; set; }
    }

    public class MonitoredDatabaseSeedDefinition
    {
        public string ServerName { get; set; }

        public string Name { get; set; }

        public string Engine { get; set; }

        public string Owner { get; set; }

        public string Description { get; set; }
    }

    public class AlertRuleSeedDefinition
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public AlertRuleType RuleType { get; set; }

        public ActivityEventType? EventType { get; set; }

        public int WindowMinutes { get; set; }

        public int ThresholdCount { get; set; }

        public string GroupByField { get; set; }

        public AlertSeverity Severity { get; set; }
    }
}
