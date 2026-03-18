using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Validation;
using Abp.UI;
using Shouldly;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.ActivityEvents.Dto;
using Team2GroupProject.DataSentinel.Monitoring;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.ActivityEvents
{
    public class ActivityEventAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IActivityEventAppService _activityEventAppService;

        public ActivityEventAppService_Tests()
        {
            _activityEventAppService = Resolve<IActivityEventAppService>();
        }

        [Fact]
        public async Task IngestAsync_should_persist_valid_events_and_redact_sensitive_evidence()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.IngestAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow,
                        EventType = ActivityEventType.Login,
                        ActorUser = " demo-user ",
                        ActorIp = " 10.10.0.5 ",
                        Severity = ActivitySeverity.Medium,
                        IsSuccess = false,
                        FailureReason = " Invalid password ",
                        Evidence = new Dictionary<string, string>
                        {
                            ["ipAddress"] = "10.10.0.5",
                            ["password"] = "sup3r-secret",
                            ["sessionToken"] = "token-value"
                        }
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
            persisted.ActorUser.ShouldBe("demo-user");
            persisted.ActorIp.ShouldBe("10.10.0.5");
            persisted.FailureReason.ShouldBe("Invalid password");
            persisted.EvidenceJson.ShouldContain("[REDACTED]");
            persisted.EvidenceJson.ShouldNotContain("sup3r-secret");
            persisted.EvidenceJson.ShouldNotContain("token-value");
        }

        [Fact]
        public async Task ImportBatchAsync_should_return_summary_for_bulk_batches()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-2),
                        EventType = ActivityEventType.Read,
                        ActorUser = "report_reader",
                        Severity = ActivitySeverity.Info,
                        IsSuccess = true,
                        RowsAffected = 24
                    },
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-1),
                        EventType = ActivityEventType.Write,
                        ActorUser = "report_writer",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true,
                        RowsAffected = 2
                    }
                }
            });

            result.ReceivedCount.ShouldBe(2);
            result.AcceptedCount.ShouldBe(2);
            result.RejectedCount.ShouldBe(0);
            result.CreatedEventIds.Count.ShouldBe(2);

            var persistedCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.ActivityEvents.Count(x => result.CreatedEventIds.Contains(x.Id))));

            persistedCount.ShouldBe(2);
        }

        [Fact]
        public async Task IngestAsync_should_allow_partial_success_for_batch_payloads()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.IngestAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-1),
                        EventType = ActivityEventType.Read,
                        ActorUser = "reporting-user",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true,
                        RowsAffected = 12
                    },
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = Guid.NewGuid(),
                        EventTime = DateTime.UtcNow,
                        EventType = ActivityEventType.Write,
                        ActorUser = " ",
                        Severity = ActivitySeverity.High,
                        IsSuccess = true,
                        DurationMs = -1
                    }
                }
            });

            result.AcceptedCount.ShouldBe(1);
            result.RejectedCount.ShouldBe(1);
            result.Errors.Count.ShouldBe(1);
            result.Errors[0].ItemIndex.ShouldBe(1);
            result.Errors[0].Errors.ShouldContain("ActorUser is required.");
            result.Errors[0].Errors.ShouldContain("DurationMs cannot be negative.");
            result.Errors[0].Errors.ShouldContain("DatabaseId does not reference a monitored database for this tenant.");

            var persistedCount = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.ActivityEvents.Count(x => result.CreatedEventIds.Contains(x.Id))));

            persistedCount.ShouldBe(1);
        }

        [Fact]
        public async Task IngestAbpAuditLogsAsync_should_map_uploaded_audit_logs_and_redact_parameter_secrets()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.IngestAbpAuditLogsAsync(new IngestAbpAuditLogsInput
            {
                DatabaseId = database.Id,
                AbpAuditLogs = new List<AbpAuditLogIngestionItemDto>
                {
                    new AbpAuditLogIngestionItemDto
                    {
                        Id = 55,
                        TenantId = tenantId,
                        UserId = null,
                        ServiceName = "Team2GroupProject.Controllers.TokenAuthController",
                        MethodName = "Authenticate",
                        Parameters = "{\"model\":{\"userNameOrEmailAddress\":\"admin\",\"password\":\"super-secret\"}}",
                        ExecutionTime = DateTime.UtcNow,
                        ExecutionDuration = 4380,
                        ClientIpAddress = "::1",
                        BrowserInfo = "Mozilla/5.0",
                        ExceptionMessage = "Login failed!",
                        Exception = "Abp.UI.UserFriendlyException: Login failed!"
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
            persisted.EventType.ShouldBe(ActivityEventType.Login);
            persisted.ActorUser.ShouldBe("admin");
            persisted.ActorIp.ShouldBe("::1");
            persisted.IsSuccess.ShouldBeFalse();
            persisted.FailureReason.ShouldBe("Login failed!");
            persisted.EvidenceJson.ShouldContain("\"auditLogId\":\"55\"");
            persisted.EvidenceJson.ShouldContain("[REDACTED]");
            persisted.EvidenceJson.ShouldNotContain("super-secret");
        }

        [Fact]
        public async Task IngestAbpAuditLogsAsync_should_reject_logs_for_another_tenant_but_allow_host_level_entries()
        {
            var tenantId = AbpSession.TenantId!.Value;

            var result = await _activityEventAppService.IngestAbpAuditLogsAsync(new IngestAbpAuditLogsInput
            {
                AbpAuditLogs = new List<AbpAuditLogIngestionItemDto>
                {
                    new AbpAuditLogIngestionItemDto
                    {
                        Id = 1,
                        TenantId = null,
                        ServiceName = "Team2GroupProject.Web.Host.Controllers.HomeController",
                        MethodName = "Index",
                        Parameters = "{}",
                        ExecutionTime = DateTime.UtcNow.AddMinutes(-5),
                        ExecutionDuration = 18,
                        ClientIpAddress = "::1"
                    },
                    new AbpAuditLogIngestionItemDto
                    {
                        Id = 2,
                        TenantId = tenantId + 99,
                        ServiceName = "Team2GroupProject.Authorization.Accounts.AccountAppService",
                        MethodName = "IsTenantAvailable",
                        Parameters = "{\"input\":{\"tenancyName\":\"Other\"}}",
                        ExecutionTime = DateTime.UtcNow,
                        ExecutionDuration = 22,
                        ClientIpAddress = "::1"
                    }
                }
            });

            result.AcceptedCount.ShouldBe(1);
            result.RejectedCount.ShouldBe(1);
            result.Errors.Count.ShouldBe(1);
            result.Errors[0].ItemIndex.ShouldBe(1);
            result.Errors[0].Errors.ShouldContain("TenantId does not match the active tenant context.");

            var persisted = await UsingDbContextAsync(async context =>
                await context.ActivityEvents.FindAsync(result.CreatedEventIds.Single()));

            persisted.ShouldNotBeNull();
            persisted.TenantId.ShouldBe(tenantId);
            persisted.EventType.ShouldBe(ActivityEventType.Read);
        }

        [Fact]
        public async Task SeedSimulatedAbpAuditLogsAsync_should_use_the_same_audit_log_shape_as_uploaded_batches()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.SeedSimulatedAbpAuditLogsAsync(new SeedSimulatedAbpAuditLogsInput
            {
                Count = 12,
                Seed = 42,
                DatabaseId = database.Id,
                IncludeFailures = false
            });

            result.AcceptedCount.ShouldBe(12);
            result.RejectedCount.ShouldBe(0);

            var persistedEvents = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.ActivityEvents
                    .Where(x => result.CreatedEventIds.Contains(x.Id))
                    .ToList()));

            persistedEvents.Count.ShouldBe(12);
            persistedEvents.All(x => x.DatabaseId == database.Id).ShouldBeTrue();
            persistedEvents.All(x => x.ServerId == database.ServerId).ShouldBeTrue();
            persistedEvents.Any(x => x.EvidenceJson.Contains("seeded-abp-audit-log")).ShouldBeTrue();
            persistedEvents.Any(x => x.EvidenceJson.Contains("serviceName")).ShouldBeTrue();
        }

        [Fact]
        public async Task ImportBatchAsync_should_fail_gracefully_when_payload_is_missing()
        {
            await Should.ThrowAsync<AbpValidationException>(() =>
                _activityEventAppService.ImportBatchAsync(null));
        }

        [Fact]
        public async Task ImportBatchAsync_should_fail_gracefully_when_batch_is_empty()
        {
            await Should.ThrowAsync<AbpValidationException>(() =>
                _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput()));
        }

        [Fact]
        public async Task ImportBatchAsync_should_reject_batches_over_the_supported_limit()
        {
            var tooManyEvents = Enumerable.Range(0, 501)
                .Select(index => new ActivityEventIngestionItemDto
                {
                    EventTime = DateTime.UtcNow.AddMinutes(-index),
                    EventType = ActivityEventType.Read,
                    ActorUser = $"bulk-user-{index.ToString(CultureInfo.InvariantCulture)}",
                    Severity = ActivitySeverity.Info,
                    IsSuccess = true
                })
                .ToList();

            var exception = await Should.ThrowAsync<UserFriendlyException>(() =>
                _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
                {
                    Events = tooManyEvents
                }));

            exception.Message.ShouldBe("Batch size cannot exceed 500 activity events.");
        }

        [Fact]
        public async Task IngestAsync_should_require_an_authenticated_user()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _activityEventAppService.IngestAsync(new IngestActivityEventsInput
                    {
                        Events = new List<ActivityEventIngestionItemDto>
                        {
                            new ActivityEventIngestionItemDto
                            {
                                EventTime = DateTime.UtcNow,
                                EventType = ActivityEventType.Login,
                                ActorUser = "anonymous",
                                Severity = ActivitySeverity.Low,
                                IsSuccess = true
                            }
                        }
                    }));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }

        private async Task<MonitoredDatabase> CreateDatabaseAsync(int tenantId)
        {
            var server = new MonitoredServer(tenantId, "Demo Server", "pg-demo-01", "Demo", "Demo monitored server.");
            var database = new MonitoredDatabase(tenantId, server.Id, "DemoDb", "PostgreSQL", "Demo monitored database.");

            server.Databases.Add(database);

            await UsingDbContextAsync(async context =>
            {
                await context.MonitoredServers.AddAsync(server);
            });

            return database;
        }
    }
}
