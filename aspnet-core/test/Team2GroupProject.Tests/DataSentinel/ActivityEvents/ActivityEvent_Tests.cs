using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Abp.Runtime.Session;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.ActivityEvents
{
    public class ActivityEvent_Tests : Team2GroupProjectTestBase
    {
        private readonly IActivityEventRepository _activityEventRepository;

        public ActivityEvent_Tests()
        {
            _activityEventRepository = Resolve<IActivityEventRepository>();
        }

        [Fact]
        public async Task Should_persist_activity_event_with_required_fields()
        {
            var tenantId = AbpSession.GetTenantId();
            var eventTime = new DateTime(2026, 3, 17, 14, 30, 0);

            var activityEvent = new ActivityEvent(
                tenantId,
                eventTime,
                ActivityEventType.Login,
                "db_analyst",
                ActivitySeverity.Info,
                isSuccess: true)
            {
                ActorIp = "192.168.1.42",
                Operation = "CONNECT",
                IsOutOfHours = false
            };

            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.ActivityEvents
                    .SingleAsync(x => x.Id == activityEvent.Id);

                persisted.TenantId.ShouldBe(tenantId);
                persisted.EventTime.ShouldBe(eventTime);
                persisted.EventType.ShouldBe(ActivityEventType.Login);
                persisted.ActorUser.ShouldBe("db_analyst");
                persisted.ActorIp.ShouldBe("192.168.1.42");
                persisted.Operation.ShouldBe("CONNECT");
                persisted.Severity.ShouldBe(ActivitySeverity.Info);
                persisted.IsSuccess.ShouldBeTrue();
                persisted.IsOutOfHours.ShouldBeFalse();
            });
        }

        [Fact]
        public async Task Should_persist_failed_event_with_failure_reason()
        {
            var tenantId = AbpSession.GetTenantId();

            var failedLogin = new ActivityEvent(
                tenantId,
                DateTime.UtcNow,
                ActivityEventType.Login,
                "unknown_user",
                ActivitySeverity.High,
                isSuccess: false)
            {
                ActorIp = "10.0.0.99",
                FailureReason = "Invalid credentials",
                IsOutOfHours = true
            };

            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(failedLogin);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.ActivityEvents
                    .SingleAsync(x => x.Id == failedLogin.Id);

                persisted.IsSuccess.ShouldBeFalse();
                persisted.FailureReason.ShouldBe("Invalid credentials");
                persisted.Severity.ShouldBe(ActivitySeverity.High);
                persisted.IsOutOfHours.ShouldBeTrue();
            });
        }

        [Fact]
        public async Task Should_persist_activity_event_with_server_and_database_links()
        {
            var tenantId = AbpSession.GetTenantId();
            var serverId = Guid.NewGuid();
            var databaseId = Guid.NewGuid();

            var activityEvent = new ActivityEvent(
                tenantId,
                DateTime.UtcNow,
                ActivityEventType.Write,
                "etl_service",
                ActivitySeverity.Low,
                isSuccess: true)
            {
                ServerId = serverId,
                DatabaseId = databaseId,
                ObjectName = "public.orders",
                Operation = "INSERT",
                RowsAffected = 250,
                DurationMs = 84
            };

            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.ActivityEvents
                    .SingleAsync(x => x.Id == activityEvent.Id);

                persisted.ServerId.ShouldBe(serverId);
                persisted.DatabaseId.ShouldBe(databaseId);
                persisted.ObjectName.ShouldBe("public.orders");
                persisted.Operation.ShouldBe("INSERT");
                persisted.RowsAffected.ShouldBe(250);
                persisted.DurationMs.ShouldBe(84);
            });
        }

        [Fact]
        public async Task Should_persist_activity_event_with_evidence_json()
        {
            var tenantId = AbpSession.GetTenantId();
            const string evidence = """{"queryHash":"abc123","clientApp":"pgAdmin","rowsScanned":50000}""";

            var activityEvent = new ActivityEvent(
                tenantId,
                DateTime.UtcNow,
                ActivityEventType.Read,
                "analyst_01",
                ActivitySeverity.Medium,
                isSuccess: true)
            {
                ObjectName = "public.financial_records",
                Operation = "SELECT",
                RowsAffected = 50000,
                EvidenceJson = evidence
            };

            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(activityEvent);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.ActivityEvents
                    .SingleAsync(x => x.Id == activityEvent.Id);

                persisted.EvidenceJson.ShouldBe(evidence);
                persisted.Severity.ShouldBe(ActivitySeverity.Medium);
            });
        }

        [MultiTenantFact]
        public async Task Should_isolate_activity_events_by_tenant()
        {
            var tenantOneEvent = new ActivityEvent(
                1,
                DateTime.UtcNow,
                ActivityEventType.Login,
                "tenant_one_user",
                ActivitySeverity.Info,
                isSuccess: true);

            var tenantTwoEvent = new ActivityEvent(
                2,
                DateTime.UtcNow,
                ActivityEventType.Login,
                "tenant_two_user",
                ActivitySeverity.Info,
                isSuccess: true);

            await UsingDbContextAsync(1, async context =>
            {
                await context.ActivityEvents.AddAsync(tenantOneEvent);
            });

            await UsingDbContextAsync(2, async context =>
            {
                await context.ActivityEvents.AddAsync(tenantTwoEvent);
            });

            await UsingDbContextAsync(async context =>
            {
                var tenantOneActors = await context.ActivityEvents
                    .Where(x => x.TenantId == 1)
                    .Select(x => x.ActorUser)
                    .ToListAsync();

                tenantOneActors.ShouldContain("tenant_one_user");
                tenantOneActors.ShouldNotContain("tenant_two_user");
            });
        }

        [Fact]
        public async Task GetFailedLoginsByActorAsync_should_return_only_failed_logins_in_window()
        {
            var tenantId = AbpSession.GetTenantId();
            var windowStart = new DateTime(2026, 3, 17, 2, 0, 0);
            var windowEnd = new DateTime(2026, 3, 17, 2, 15, 0);
            const string actor = "suspicious_user";

            // 3 failed logins within window
            for (int i = 0; i < 3; i++)
            {
                await UsingDbContextAsync(async context =>
                {
                    await context.ActivityEvents.AddAsync(new ActivityEvent(
                        tenantId,
                        windowStart.AddMinutes(i * 3),
                        ActivityEventType.Login,
                        actor,
                        ActivitySeverity.High,
                        isSuccess: false)
                    {
                        FailureReason = "Invalid credentials"
                    });
                });
            }

            // 1 successful login within window (should be excluded)
            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(new ActivityEvent(
                    tenantId,
                    windowStart.AddMinutes(10),
                    ActivityEventType.Login,
                    actor,
                    ActivitySeverity.Info,
                    isSuccess: true));
            });

            // 1 failed login outside window (should be excluded)
            await UsingDbContextAsync(async context =>
            {
                await context.ActivityEvents.AddAsync(new ActivityEvent(
                    tenantId,
                    windowStart.AddMinutes(-5),
                    ActivityEventType.Login,
                    actor,
                    ActivitySeverity.High,
                    isSuccess: false));
            });

            var results = await _activityEventRepository.GetFailedLoginsByActorAsync(
                tenantId, actor, windowStart, windowEnd);

            results.Count.ShouldBe(3);
            results.ShouldAllBe(x => !x.IsSuccess);
            results.ShouldAllBe(x => x.EventType == ActivityEventType.Login);
        }

        [Fact]
        public async Task GetRecentByDatabaseAsync_should_return_events_ordered_by_time_descending()
        {
            var tenantId = AbpSession.GetTenantId();
            var databaseId = Guid.NewGuid();
            var baseTime = new DateTime(2026, 3, 17, 10, 0, 0);

            for (int i = 0; i < 5; i++)
            {
                var eventTime = baseTime.AddMinutes(i);
                await UsingDbContextAsync(async context =>
                {
                    await context.ActivityEvents.AddAsync(new ActivityEvent(
                        tenantId,
                        eventTime,
                        ActivityEventType.Read,
                        "reader",
                        ActivitySeverity.Info,
                        isSuccess: true)
                    {
                        DatabaseId = databaseId
                    });
                });
            }

            var recent = await _activityEventRepository.GetRecentByDatabaseAsync(databaseId, 3);

            recent.Count.ShouldBe(3);
            recent[0].EventTime.ShouldBeGreaterThan(recent[1].EventTime);
            recent[1].EventTime.ShouldBeGreaterThan(recent[2].EventTime);
        }
    }
}
