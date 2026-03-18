using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Runtime.Session;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Detection.Dto;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.Detection
{
    public class AnomalyDetectionAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IAnomalyDetectionAppService _anomalyDetectionAppService;

        public AnomalyDetectionAppService_Tests()
        {
            _anomalyDetectionAppService = Resolve<IAnomalyDetectionAppService>();
        }

        [Fact]
        public async Task EvaluateThresholdRulesAsync_should_create_an_alert_for_a_threshold_breach()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 18, 12, 0, 0, DateTimeKind.Utc);
            var server = new MonitoredServer(tenantId, "Threshold Server", "pg-threshold-01", "Demo", "Threshold test server.");
            var database = new MonitoredDatabase(tenantId, server.Id, "ThresholdDb", "PostgreSQL", "Threshold test database.");
            var rule = new AlertRule(tenantId, "Write Spike", AlertRuleType.ThresholdBased, ActivitySeverity.High, 10, 3)
            {
                EventType = ActivityEventType.Write,
                GroupByField = AlertRuleGroupByField.ActorUser
            };

            server.Databases.Add(database);

            var events = new[]
            {
                CreateActivityEvent(tenantId, server.Id, database.Id, evaluationTime.AddMinutes(-9), "writer-a"),
                CreateActivityEvent(tenantId, server.Id, database.Id, evaluationTime.AddMinutes(-6), "writer-a"),
                CreateActivityEvent(tenantId, server.Id, database.Id, evaluationTime.AddMinutes(-2), "writer-a"),
                CreateActivityEvent(tenantId, server.Id, database.Id, evaluationTime.AddMinutes(-20), "writer-a")
            };

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
                await context.AlertRules.AddAsync(rule);
                foreach (var activityEvent in events)
                {
                    await context.ActivityEvents.AddAsync(activityEvent);
                }
            });

            var result = await _anomalyDetectionAppService.EvaluateThresholdRulesAsync(new EvaluateThresholdRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            result.EvaluatedRuleCount.ShouldBe(1);
            result.CreatedAlertCount.ShouldBe(1);
            result.DuplicateAlertCount.ShouldBe(0);
            result.CreatedAlertIds.Count.ShouldBe(1);

            var alert = await UsingDbContextAsync(async context =>
                await context.SecurityAlerts.FindAsync(result.CreatedAlertIds.Single()));
            var riskProfile = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.UserRiskProfiles.Single(x => x.ActorUser == "writer-a")));

            alert.ShouldNotBeNull();
            alert.RuleId.ShouldBe(rule.Id);
            alert.RelatedEventCount.ShouldBe(3);
            alert.PrimaryActorUser.ShouldBe("writer-a");
            alert.CorrelationKey.ShouldNotBeNullOrWhiteSpace();

            riskProfile.AlertCount.ShouldBe(1);
            riskProfile.HighSeverityAlertCount.ShouldBe(1);
            riskProfile.RiskScore.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task EvaluateThresholdRulesAsync_should_not_duplicate_alerts_for_the_same_event_cluster()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 18, 13, 0, 0, DateTimeKind.Utc);
            var rule = new AlertRule(tenantId, "Read Spike", AlertRuleType.ThresholdBased, ActivitySeverity.Medium, 15, 2)
            {
                EventType = ActivityEventType.Read,
                GroupByField = AlertRuleGroupByField.DatabaseId
            };

            var databaseId = Guid.NewGuid();
            var events = new[]
            {
                new ActivityEvent(tenantId, evaluationTime.AddMinutes(-10), ActivityEventType.Read, "reader-1", ActivitySeverity.Info, true)
                {
                    DatabaseId = databaseId
                },
                new ActivityEvent(tenantId, evaluationTime.AddMinutes(-5), ActivityEventType.Read, "reader-2", ActivitySeverity.Info, true)
                {
                    DatabaseId = databaseId
                }
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
                foreach (var activityEvent in events)
                {
                    await context.ActivityEvents.AddAsync(activityEvent);
                }
            });

            var firstRun = await _anomalyDetectionAppService.EvaluateThresholdRulesAsync(new EvaluateThresholdRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            var secondRun = await _anomalyDetectionAppService.EvaluateThresholdRulesAsync(new EvaluateThresholdRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            firstRun.CreatedAlertCount.ShouldBe(1);
            secondRun.CreatedAlertCount.ShouldBe(0);
            secondRun.DuplicateAlertCount.ShouldBe(1);

            var alertCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.SecurityAlerts.Count(x => x.RuleId == rule.Id)));

            alertCount.ShouldBe(1);
        }

        [Fact]
        public async Task EvaluateOutOfHoursRulesAsync_should_create_an_alert_for_a_risky_out_of_hours_event()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 21, 1, 30, 0, DateTimeKind.Utc);
            var server = new MonitoredServer(tenantId, "Out Of Hours Server", "pg-ooh-01", "Demo", "Out-of-hours test server.");
            var database = new MonitoredDatabase(tenantId, server.Id, "NightOpsDb", "PostgreSQL", "Out-of-hours test database.");
            var rule = new AlertRule(tenantId, "Out Of Hours Write", AlertRuleType.OutOfHours, ActivitySeverity.High, 0, 1);

            server.Databases.Add(database);

            var matchingEvent = CreateActivityEvent(
                tenantId,
                server.Id,
                database.Id,
                evaluationTime,
                "night-writer",
                ActivityEventType.Write,
                isOutOfHours: true);
            var nonMatchingEvent = CreateActivityEvent(
                tenantId,
                server.Id,
                database.Id,
                evaluationTime,
                "day-reader",
                ActivityEventType.Read,
                isOutOfHours: true);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
                await context.AlertRules.AddAsync(rule);
                await context.ActivityEvents.AddAsync(matchingEvent);
                await context.ActivityEvents.AddAsync(nonMatchingEvent);
            });

            var result = await _anomalyDetectionAppService.EvaluateOutOfHoursRulesAsync(new EvaluateOutOfHoursRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            result.EvaluatedRuleCount.ShouldBe(1);
            result.CreatedAlertCount.ShouldBe(1);
            result.DuplicateAlertCount.ShouldBe(0);
            result.CandidateGroupCount.ShouldBe(1);

            var alert = await UsingDbContextAsync(async context =>
                await context.SecurityAlerts.FindAsync(result.CreatedAlertIds.Single()));
            var riskProfile = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.UserRiskProfiles.Single(x => x.ActorUser == "night-writer")));

            alert.ShouldNotBeNull();
            alert.RuleId.ShouldBe(rule.Id);
            alert.RelatedEventCount.ShouldBe(1);
            alert.PrimaryActorUser.ShouldBe("night-writer");
            alert.TriggeringActivityEventId.ShouldBe(matchingEvent.Id);
            alert.CorrelationKey.ShouldNotBeNullOrWhiteSpace();

            riskProfile.AlertCount.ShouldBe(1);
            riskProfile.HighSeverityAlertCount.ShouldBe(1);
            riskProfile.OutOfHoursEventCount.ShouldBe(1);
            riskProfile.RiskScore.ShouldBeGreaterThan(0);
        }

        [Fact]
        public async Task EvaluateOutOfHoursRulesAsync_should_not_duplicate_alerts_for_the_same_event()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 21, 2, 0, 0, DateTimeKind.Utc);
            var rule = new AlertRule(tenantId, "Out Of Hours Privileged Action", AlertRuleType.OutOfHours, ActivitySeverity.Medium, 0, 1);
            var activityEvent = new ActivityEvent(tenantId, evaluationTime, ActivityEventType.PrivilegedAction, "night-admin", ActivitySeverity.High, true)
            {
                IsOutOfHours = true,
                Operation = "ALTER ROLE"
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            var firstRun = await _anomalyDetectionAppService.EvaluateOutOfHoursRulesAsync(new EvaluateOutOfHoursRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });
            var secondRun = await _anomalyDetectionAppService.EvaluateOutOfHoursRulesAsync(new EvaluateOutOfHoursRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            firstRun.CreatedAlertCount.ShouldBe(1);
            secondRun.CreatedAlertCount.ShouldBe(0);
            secondRun.DuplicateAlertCount.ShouldBe(1);

            var alertCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.SecurityAlerts.Count(x => x.RuleId == rule.Id)));

            alertCount.ShouldBe(1);
        }

        [Fact]
        public async Task EvaluateOutOfHoursRulesAsync_should_ignore_in_hours_events_and_low_signal_event_types()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 21, 3, 0, 0, DateTimeKind.Utc);
            var rule = new AlertRule(tenantId, "Out Of Hours Rule", AlertRuleType.OutOfHours, ActivitySeverity.Medium, 0, 1);

            var inHoursWrite = new ActivityEvent(tenantId, evaluationTime, ActivityEventType.Write, "writer-in-hours", ActivitySeverity.Low, true)
            {
                IsOutOfHours = false,
                Operation = "UPDATE"
            };
            var outOfHoursRead = new ActivityEvent(tenantId, evaluationTime, ActivityEventType.Read, "reader-after-hours", ActivitySeverity.Low, true)
            {
                IsOutOfHours = true,
                Operation = "SELECT"
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
                await context.ActivityEvents.AddAsync(inHoursWrite);
                await context.ActivityEvents.AddAsync(outOfHoursRead);
            });

            var result = await _anomalyDetectionAppService.EvaluateOutOfHoursRulesAsync(new EvaluateOutOfHoursRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            result.EvaluatedRuleCount.ShouldBe(1);
            result.CandidateGroupCount.ShouldBe(0);
            result.CreatedAlertCount.ShouldBe(0);
            result.DuplicateAlertCount.ShouldBe(0);

            var alertCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.SecurityAlerts.Count(x => x.RuleId == rule.Id)));

            alertCount.ShouldBe(0);
        }

        [Fact]
        public async Task EvaluateOutOfHoursRulesAsync_should_ignore_disabled_rules()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluationTime = new DateTime(2026, 3, 21, 4, 0, 0, DateTimeKind.Utc);
            var rule = new AlertRule(tenantId, "Disabled Out Of Hours", AlertRuleType.OutOfHours, ActivitySeverity.High, 0, 1, isEnabled: false);
            var activityEvent = new ActivityEvent(tenantId, evaluationTime, ActivityEventType.Write, "disabled-user", ActivitySeverity.High, true)
            {
                IsOutOfHours = true,
                Operation = "UPDATE"
            };

            await UsingDbContextAsync(async context =>
            {
                await context.AlertRules.AddAsync(rule);
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            var result = await _anomalyDetectionAppService.EvaluateOutOfHoursRulesAsync(new EvaluateOutOfHoursRulesInput
            {
                EvaluationTimeUtc = evaluationTime
            });

            result.EvaluatedRuleCount.ShouldBe(0);
            result.CreatedAlertCount.ShouldBe(0);

            var alertCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.SecurityAlerts.Count(x => x.RuleId == rule.Id)));

            alertCount.ShouldBe(0);
        }

        private static ActivityEvent CreateActivityEvent(
            int tenantId,
            Guid serverId,
            Guid databaseId,
            DateTime eventTime,
            string actorUser,
            ActivityEventType eventType = ActivityEventType.Write,
            bool isOutOfHours = false)
        {
            return new ActivityEvent(tenantId, eventTime, eventType, actorUser, ActivitySeverity.Low, true)
            {
                ServerId = serverId,
                DatabaseId = databaseId,
                Operation = eventType == ActivityEventType.PrivilegedAction ? "ALTER ROLE" : "UPDATE",
                ObjectName = "public.orders",
                IsOutOfHours = isOutOfHours
            };
        }
    }
}
