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

        private static ActivityEvent CreateActivityEvent(
            int tenantId,
            Guid serverId,
            Guid databaseId,
            DateTime eventTime,
            string actorUser)
        {
            return new ActivityEvent(tenantId, eventTime, ActivityEventType.Write, actorUser, ActivitySeverity.Low, true)
            {
                ServerId = serverId,
                DatabaseId = databaseId,
                Operation = "UPDATE",
                ObjectName = "public.orders"
            };
        }
    }
}
