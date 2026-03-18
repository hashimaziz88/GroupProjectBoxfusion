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
        public async Task ImportBatchAsync_should_normalize_unspecified_event_times_to_utc()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);
            var unspecifiedTime = new DateTime(2026, 3, 18, 8, 15, 0, DateTimeKind.Unspecified);

            var result = await _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        DatabaseId = database.Id,
                        EventTime = unspecifiedTime,
                        EventType = ActivityEventType.Read,
                        ActorUser = "time-normalized-user",
                        Severity = ActivitySeverity.Info,
                        IsSuccess = true
                    }
                }
            });

            var persisted = await UsingDbContextAsync(async context =>
                await context.ActivityEvents.FindAsync(result.CreatedEventIds.Single()));

            persisted.ShouldNotBeNull();
            persisted.EventTime.ShouldBe(DateTime.SpecifyKind(unspecifiedTime, DateTimeKind.Utc));
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
        public async Task ImportBatchAsync_should_reject_duplicate_source_events_within_the_same_batch()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var result = await _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        SourceSystem = "DemoImport",
                        SourceEventKey = "duplicate-001",
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-2),
                        EventType = ActivityEventType.Write,
                        ActorUser = "duplicate-user",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true
                    },
                    new ActivityEventIngestionItemDto
                    {
                        SourceSystem = "DemoImport",
                        SourceEventKey = "duplicate-001",
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-1),
                        EventType = ActivityEventType.Write,
                        ActorUser = "duplicate-user",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true
                    }
                }
            });

            result.AcceptedCount.ShouldBe(1);
            result.RejectedCount.ShouldBe(1);
            result.Errors.Single().Errors.ShouldContain("Duplicate source event detected in the submitted batch.");
        }

        [Fact]
        public async Task ImportBatchAsync_should_reject_source_events_that_were_already_imported()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            var firstImport = await _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        SourceSystem = "DemoImport",
                        SourceEventKey = "existing-001",
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow.AddMinutes(-1),
                        EventType = ActivityEventType.Write,
                        ActorUser = "existing-user",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true
                    }
                }
            });

            firstImport.AcceptedCount.ShouldBe(1);

            var secondImport = await _activityEventAppService.ImportBatchAsync(new IngestActivityEventsInput
            {
                Events = new List<ActivityEventIngestionItemDto>
                {
                    new ActivityEventIngestionItemDto
                    {
                        SourceSystem = "DemoImport",
                        SourceEventKey = "existing-001",
                        DatabaseId = database.Id,
                        EventTime = DateTime.UtcNow,
                        EventType = ActivityEventType.Write,
                        ActorUser = "existing-user",
                        Severity = ActivitySeverity.Low,
                        IsSuccess = true
                    }
                }
            });

            secondImport.AcceptedCount.ShouldBe(0);
            secondImport.RejectedCount.ShouldBe(1);
            secondImport.Errors.Single().Errors.ShouldContain("Source event has already been imported for this tenant.");
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

        // ── GetPaged tests ────────────────────────────────────────────────────

        [Fact]
        public async Task GetPagedAsync_should_return_all_events_for_current_tenant()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 5);

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                MaxResultCount = 50
            });

            result.TotalCount.ShouldBe(5);
            result.Items.Count.ShouldBe(5);
            result.Items.ShouldAllBe(x => x.EventId.StartsWith("EVT-"));
        }

        [Fact]
        public async Task GetPagedAsync_keyword_filter_matches_on_actor_user()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { ActorUser = "regular_user" });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ActorUser = "admin_ops" });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Keyword = "admin"
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.ActorUser == "admin_ops");
        }

        [Fact]
        public async Task GetPagedAsync_keyword_filter_matches_on_operation()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Operation = "SELECT" });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { Operation = "INSERT" });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Keyword = "SELECT"
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.Operation == "SELECT");
        }

        [Fact]
        public async Task GetPagedAsync_event_type_filter_returns_only_matching_type()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { EventType = ActivityEventType.Read });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventType = ActivityEventType.Write });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                EventType = ActivityEventType.Read
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.EventType == ActivityEventType.Read);
        }

        [Fact]
        public async Task GetPagedAsync_database_id_filter_returns_only_matching_database()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            await SeedEventsAsync(tenantId, 2, new SeedOptions { DatabaseId = database.Id });
            await SeedEventsAsync(tenantId, 3);

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                DatabaseId = database.Id
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.DatabaseId == database.Id);
        }

        [Fact]
        public async Task GetPagedAsync_database_id_filter_includes_database_name()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);

            await SeedEventsAsync(tenantId, 1, new SeedOptions { DatabaseId = database.Id });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                DatabaseId = database.Id
            });

            result.Items.Single().DatabaseName.ShouldBe("DemoDb");
        }

        [Fact]
        public async Task GetPagedAsync_actor_user_filter_returns_only_matching_user()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { ActorUser = "john.doe" });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ActorUser = "jane.smith" });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                ActorUser = "john.doe"
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.ActorUser == "john.doe");
        }

        [Fact]
        public async Task GetPagedAsync_tab_suspicious_activity_returns_medium_and_above_severity_only()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Severity = ActivitySeverity.Info });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Severity = ActivitySeverity.Low });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { Severity = ActivitySeverity.Medium });
            await SeedEventsAsync(tenantId, 1, new SeedOptions { Severity = ActivitySeverity.High });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Tab = ActivityEventTab.SuspiciousActivity
            });

            result.TotalCount.ShouldBe(4);
            result.Items.ShouldAllBe(x => x.Severity >= ActivitySeverity.Medium);
        }

        [Fact]
        public async Task GetPagedAsync_tab_failed_events_returns_only_unsuccessful_events()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 4, new SeedOptions { IsSuccess = true });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { IsSuccess = false });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Tab = ActivityEventTab.FailedEvents
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => !x.IsSuccess);
        }

        [Fact]
        public async Task GetPagedAsync_pagination_skip_and_take_are_applied_correctly()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 10);

            var firstPage = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                SkipCount = 0,
                MaxResultCount = 3
            });

            var secondPage = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                SkipCount = 3,
                MaxResultCount = 3
            });

            firstPage.TotalCount.ShouldBe(10);
            firstPage.Items.Count.ShouldBe(3);
            secondPage.Items.Count.ShouldBe(3);

            var firstPageIds = firstPage.Items.Select(x => x.Id).ToList();
            var secondPageIds = secondPage.Items.Select(x => x.Id).ToList();
            firstPageIds.Intersect(secondPageIds).ShouldBeEmpty();
        }

        [Fact]
        public async Task GetPagedAsync_filters_can_be_combined()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ActorUser = "analyst", EventType = ActivityEventType.Read, IsSuccess = true });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { ActorUser = "analyst", EventType = ActivityEventType.Write, IsSuccess = true });
            await SeedEventsAsync(tenantId, 1, new SeedOptions { ActorUser = "analyst", EventType = ActivityEventType.Login, IsSuccess = false });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                ActorUser = "analyst",
                EventType = ActivityEventType.Read,
                Tab = ActivityEventTab.All
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.ActorUser == "analyst" && x.EventType == ActivityEventType.Read);
        }

        [Fact]
        public async Task GetPagedAsync_start_date_filter_excludes_events_before_range()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var cutoff = DateTime.UtcNow.AddHours(-1);
            await SeedEventsAsync(tenantId, 3, new SeedOptions { EventTime = DateTime.UtcNow.AddHours(-2) });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventTime = DateTime.UtcNow });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                StartDate = cutoff
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.EventTime >= cutoff);
        }

        [Fact]
        public async Task GetPagedAsync_end_date_filter_excludes_events_after_range()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var cutoff = DateTime.UtcNow.AddHours(-1);
            await SeedEventsAsync(tenantId, 3, new SeedOptions { EventTime = DateTime.UtcNow.AddHours(-2) });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventTime = DateTime.UtcNow });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                EndDate = cutoff
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.EventTime <= cutoff);
        }

        [Fact]
        public async Task GetPagedAsync_date_range_returns_only_events_within_window()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var start = DateTime.UtcNow.AddHours(-3);
            var end = DateTime.UtcNow.AddHours(-1);
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventTime = DateTime.UtcNow.AddHours(-4) }); // before
            await SeedEventsAsync(tenantId, 3, new SeedOptions { EventTime = DateTime.UtcNow.AddHours(-2) }); // within
            await SeedEventsAsync(tenantId, 1, new SeedOptions { EventTime = DateTime.UtcNow });              // after

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                StartDate = start,
                EndDate = end
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.EventTime >= start && x.EventTime <= end);
        }

        [Fact]
        public async Task GetPagedAsync_severity_filter_returns_only_matching_severity()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { Severity = ActivitySeverity.High });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Severity = ActivitySeverity.Critical });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Severity = ActivitySeverity.High
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.Severity == ActivitySeverity.High);
        }

        [Fact]
        public async Task GetPagedAsync_server_id_filter_returns_only_matching_server()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var database = await CreateDatabaseAsync(tenantId);
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ServerId = database.ServerId });
            await SeedEventsAsync(tenantId, 3);

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                ServerId = database.ServerId
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.ServerId == database.ServerId);
        }

        [Fact]
        public async Task GetPagedAsync_actor_ip_filter_returns_only_matching_ip()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ActorIp = "10.0.0.1" });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { ActorIp = "192.168.1.5" });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                ActorIp = "10.0.0.1"
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => x.ActorIp == "10.0.0.1");
        }

        [Fact]
        public async Task GetPagedAsync_is_success_filter_returns_only_matching_outcome()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 4, new SeedOptions { IsSuccess = true });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { IsSuccess = false });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                IsSuccess = false
            });

            result.TotalCount.ShouldBe(2);
            result.Items.ShouldAllBe(x => !x.IsSuccess);
        }

        [Fact]
        public async Task GetPagedAsync_operation_filter_returns_only_matching_operation()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { Operation = "SELECT" });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Operation = "DELETE" });

            var result = await _activityEventAppService.GetPagedAsync(new GetActivityEventsInput
            {
                Operation = "SELECT"
            });

            result.TotalCount.ShouldBe(3);
            result.Items.ShouldAllBe(x => x.Operation == "SELECT");
        }

        // ── GetSummary tests ──────────────────────────────────────────────────

        [Fact]
        public async Task GetSummaryAsync_counts_each_event_type_correctly()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 3, new SeedOptions { EventType = ActivityEventType.Read });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventType = ActivityEventType.Write });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { EventType = ActivityEventType.Login });
            await SeedEventsAsync(tenantId, 1, new SeedOptions { EventType = ActivityEventType.Logout });
            await SeedEventsAsync(tenantId, 1, new SeedOptions { EventType = ActivityEventType.PrivilegedAction });

            var summary = await _activityEventAppService.GetSummaryAsync();

            summary.TotalEvents.ShouldBe(9);
            summary.ReadOps.ShouldBe(3);
            summary.WriteOps.ShouldBe(2);
            summary.AuthEvents.ShouldBe(3); // Login + Logout
            summary.PrivilegedOps.ShouldBe(1);
        }

        [Fact]
        public async Task GetSummaryAsync_tab_badge_counts_are_correct()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Severity = ActivitySeverity.Info, IsSuccess = true });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { Severity = ActivitySeverity.Medium, IsSuccess = true });
            await SeedEventsAsync(tenantId, 2, new SeedOptions { Severity = ActivitySeverity.High, IsSuccess = false });

            var summary = await _activityEventAppService.GetSummaryAsync();

            summary.SuspiciousActivityCount.ShouldBe(5); // Medium + High
            summary.FailedEventsCount.ShouldBe(2);
        }

        [Fact]
        public async Task GetSummaryAsync_returns_zero_summary_when_no_events_exist()
        {
            var summary = await _activityEventAppService.GetSummaryAsync();

            summary.TotalEvents.ShouldBe(0);
            summary.ReadOps.ShouldBe(0);
            summary.WriteOps.ShouldBe(0);
            summary.AuthEvents.ShouldBe(0);
            summary.PrivilegedOps.ShouldBe(0);
            summary.SuspiciousActivityCount.ShouldBe(0);
            summary.FailedEventsCount.ShouldBe(0);
        }

        // ── GetFilterOptions tests ────────────────────────────────────────────

        [Fact]
        public async Task GetFilterOptionsAsync_returns_only_databases_that_have_events()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var dbWithEvents = await CreateDatabaseAsync(tenantId);
            await CreateDatabaseAsync(tenantId); // second database, no events

            await SeedEventsAsync(tenantId, 2, new SeedOptions { DatabaseId = dbWithEvents.Id });

            var options = await _activityEventAppService.GetFilterOptionsAsync();

            options.Databases.ShouldContain(x => x.Id == dbWithEvents.Id);
            options.Databases.Count.ShouldBe(1);
        }

        [Fact]
        public async Task GetFilterOptionsAsync_returns_distinct_actor_users_sorted()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedEventsAsync(tenantId, 2, new SeedOptions { ActorUser = "zach" });
            await SeedEventsAsync(tenantId, 3, new SeedOptions { ActorUser = "alice" });
            await SeedEventsAsync(tenantId, 1, new SeedOptions { ActorUser = "alice" }); // duplicate — should appear once

            var options = await _activityEventAppService.GetFilterOptionsAsync();

            options.Users.ShouldContain("alice");
            options.Users.ShouldContain("zach");
            options.Users.Count(x => x == "alice").ShouldBe(1);
            options.Users[0].ShouldBe("alice"); // sorted ascending
        }

        // ── Authorization tests ───────────────────────────────────────────────

        [Fact]
        public async Task GetPagedAsync_should_require_authenticated_user()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _activityEventAppService.GetPagedAsync(new GetActivityEventsInput()));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }

        [Fact]
        public async Task GetSummaryAsync_should_require_authenticated_user()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _activityEventAppService.GetSummaryAsync());
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private sealed class SeedOptions
        {
            public ActivityEventType EventType = ActivityEventType.Read;
            public ActivitySeverity Severity = ActivitySeverity.Info;
            public string ActorUser = "test_user";
            public string ActorIp = null;
            public string Operation = "SELECT";
            public bool IsSuccess = true;
            public Guid? DatabaseId = null;
            public Guid? ServerId = null;
            public DateTime? EventTime = null;
        }

        private async Task SeedEventsAsync(int tenantId, int count, SeedOptions opts = null)
        {
            opts ??= new SeedOptions();

            for (var i = 0; i < count; i++)
            {
                var e = new ActivityEvent(
                    tenantId,
                    opts.EventTime ?? DateTime.UtcNow.AddSeconds(-i),
                    opts.EventType,
                    opts.ActorUser,
                    opts.Severity,
                    opts.IsSuccess)
                {
                    ActorIp = opts.ActorIp,
                    Operation = opts.Operation,
                    DatabaseId = opts.DatabaseId,
                    ServerId = opts.ServerId
                };

                await UsingDbContextAsync(async context =>
                {
                    await context.ActivityEvents.AddAsync(e);
                });
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
