using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.ActivityEvents.Dto;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Intake)]
    public class ActivityEventAppService : Team2GroupProjectAppServiceBase, IActivityEventAppService
    {
        private const string BatchImportSourceSystem = "BatchImport";
        private const string AbpAuditLogSourceSystem = "AbpAuditLog";
        private const int MaxBatchSize = 500;
        private const int MaxEvidenceEntries = 25;
        private const int MaxEvidenceKeyLength = 64;
        private const int MaxEvidenceValueLength = 1024;
        private const string RedactedValue = "[REDACTED]";

        private static readonly string[] SensitiveEvidenceFragments =
        {
            "password",
            "passwd",
            "secret",
            "token",
            "apikey",
            "api_key",
            "privatekey",
            "credential",
            "authorization",
            "cookie",
            "session",
            "connectionstring",
            "connstr"
        };

        private readonly IActivityEventRepository _activityEventRepository;
        private readonly IMonitoredServerRepository _monitoredServerRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IThresholdRuleEvaluator _thresholdRuleEvaluator;
        private readonly IOutOfHoursRuleEvaluator _outOfHoursRuleEvaluator;
        private readonly IRepeatedFailureEvaluator _repeatedFailureEvaluator;
        private readonly IPrivilegedActionEvaluator _privilegedActionEvaluator;

        public ActivityEventAppService(
            IActivityEventRepository activityEventRepository,
            IMonitoredServerRepository monitoredServerRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IThresholdRuleEvaluator thresholdRuleEvaluator,
            IOutOfHoursRuleEvaluator outOfHoursRuleEvaluator,
            IRepeatedFailureEvaluator repeatedFailureEvaluator,
            IPrivilegedActionEvaluator privilegedActionEvaluator)
        {
            _activityEventRepository = activityEventRepository;
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _thresholdRuleEvaluator = thresholdRuleEvaluator;
            _outOfHoursRuleEvaluator = outOfHoursRuleEvaluator;
            _repeatedFailureEvaluator = repeatedFailureEvaluator;
            _privilegedActionEvaluator = privilegedActionEvaluator;
        }


        [DisableAuditing]
        public async Task<ActivityEventIngestionResultDto> ImportBatchAsync(IngestActivityEventsInput input)
        {
            var items = GetValidatedActivityEventBatchItems(input);
            return await IngestInternalAsync(AbpSession.GetTenantId(), items);
        }

        [DisableAuditing]
        public async Task<ActivityEventIngestionResultDto> IngestAsync(IngestActivityEventsInput input)
        {
            return await ImportBatchAsync(input);
        }

        [DisableAuditing]
        public async Task<ActivityEventIngestionResultDto> IngestAbpAuditLogsAsync(IngestAbpAuditLogsInput input)
        {
            var auditLogs = GetValidatedAuditLogBatchItems(input);

            var tenantId = AbpSession.GetTenantId();
            var result = new ActivityEventIngestionResultDto
            {
                ReceivedCount = auditLogs.Count
            };

            var mappedEvents = new List<ActivityEventIngestionItemDto>();
            var sourceIndexes = new List<int>();

            for (var index = 0; index < auditLogs.Count; index++)
            {
                var auditLog = auditLogs[index];
                var validationErrors = ValidateAuditLogItem(auditLog, tenantId);

                if (validationErrors.Count > 0)
                {
                    result.Errors.Add(new ActivityEventIngestionErrorDto
                    {
                        ItemIndex = index,
                        Errors = validationErrors
                    });
                    continue;
                }

                mappedEvents.Add(MapAuditLogItem(auditLog, input));
                sourceIndexes.Add(index);
            }

            if (mappedEvents.Count > 0)
            {
                var mappedResult = await IngestInternalAsync(tenantId, mappedEvents, sourceIndexes);
                result.CreatedEventIds.AddRange(mappedResult.CreatedEventIds);
                result.Errors.AddRange(mappedResult.Errors);
                result.DetectionSummary = mappedResult.DetectionSummary;
            }

            result.AcceptedCount = result.CreatedEventIds.Count;
            result.RejectedCount = result.Errors.Count;

            return result;
        }

        [DisableAuditing]
        public async Task<ActivityEventIngestionResultDto> SeedSimulatedAbpAuditLogsAsync(SeedSimulatedAbpAuditLogsInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var simulatedAuditLogs = BuildSimulatedAuditLogs(input, tenantId);

            return await IngestAbpAuditLogsAsync(new IngestAbpAuditLogsInput
            {
                ServerId = input.ServerId,
                DatabaseId = input.DatabaseId,
                AbpAuditLogs = simulatedAuditLogs
            });
        }

        private async Task<ActivityEventIngestionResultDto> IngestInternalAsync(
            int tenantId,
            IReadOnlyList<ActivityEventIngestionItemDto> items,
            IReadOnlyList<int> sourceIndexes = null)
        {
            EnsureBatchSizeWithinLimit(items.Count, "activity events");

            var result = new ActivityEventIngestionResultDto
            {
                ReceivedCount = items.Count
            };

            var servers = await LoadServersAsync(tenantId, items);
            var databases = await LoadDatabasesAsync(tenantId, items);
            var seenSourceIdentities = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var validEvents = new List<ActivityEvent>();

            for (var index = 0; index < items.Count; index++)
            {
                var item = items[index];
                var validationErrors = ValidateItem(item, servers, databases);

                if (validationErrors.Count > 0)
                {
                    result.Errors.Add(new ActivityEventIngestionErrorDto
                    {
                        ItemIndex = ResolveSourceIndex(sourceIndexes, index),
                        Errors = validationErrors
                    });
                    continue;
                }

                var normalizedEventTime = NormalizeEventTime(item.EventTime.Value);
                var normalizedActorUser = NormalizeOptional(item.ActorUser, DataSentinelConsts.ActorUserMaxLength);
                var normalizedActorIp = NormalizeOptional(item.ActorIp, DataSentinelConsts.ActorIpMaxLength);
                var normalizedObjectName = NormalizeOptional(item.ObjectName, DataSentinelConsts.ObjectNameMaxLength);
                var normalizedOperation = NormalizeOperation(item.Operation);
                var normalizedFailureReason = item.IsSuccess.Value
                    ? null
                    : NormalizeOptional(item.FailureReason, DataSentinelConsts.FailureReasonMaxLength);
                var sanitizedEvidenceJson = SanitizeEvidence(item.Evidence);
                var normalizedSourceSystem = NormalizeSourceSystem(item.SourceSystem);
                var normalizedSourceEventKey = ResolveSourceEventKey(
                    item,
                    normalizedSourceSystem,
                    normalizedEventTime,
                    normalizedActorUser,
                    normalizedActorIp,
                    normalizedObjectName,
                    normalizedOperation,
                    normalizedFailureReason,
                    sanitizedEvidenceJson);
                var sourceIdentity = ComposeSourceIdentity(normalizedSourceSystem, normalizedSourceEventKey);

                if (!seenSourceIdentities.Add(sourceIdentity))
                {
                    result.Errors.Add(new ActivityEventIngestionErrorDto
                    {
                        ItemIndex = ResolveSourceIndex(sourceIndexes, index),
                        Errors = new List<string> { "Duplicate source event detected in the submitted batch." }
                    });
                    continue;
                }

                var existingEvent = await _activityEventRepository.FindBySourceAsync(
                    tenantId,
                    normalizedSourceSystem,
                    normalizedSourceEventKey);

                if (existingEvent != null)
                {
                    result.Errors.Add(new ActivityEventIngestionErrorDto
                    {
                        ItemIndex = ResolveSourceIndex(sourceIndexes, index),
                        Errors = new List<string> { "Source event has already been imported for this tenant." }
                    });
                    continue;
                }

                var database = item.DatabaseId.HasValue ? databases[item.DatabaseId.Value] : null;
                var activityEvent = new ActivityEvent(
                    tenantId,
                    normalizedEventTime,
                    item.EventType.Value,
                    normalizedActorUser,
                    item.Severity.Value,
                    item.IsSuccess.Value)
                {
                    SourceSystem = normalizedSourceSystem,
                    SourceEventKey = normalizedSourceEventKey,
                    ServerId = item.ServerId ?? database?.ServerId,
                    DatabaseId = item.DatabaseId,
                    ActorIp = normalizedActorIp,
                    ObjectName = normalizedObjectName,
                    Operation = normalizedOperation,
                    RowsAffected = item.RowsAffected,
                    DurationMs = item.DurationMs,
                    IsOutOfHours = DetermineIsOutOfHours(normalizedEventTime),
                    FailureReason = normalizedFailureReason,
                    EvidenceJson = sanitizedEvidenceJson
                };

                validEvents.Add(activityEvent);
                result.CreatedEventIds.Add(activityEvent.Id);
            }

            foreach (var activityEvent in validEvents)
            {
                await _activityEventRepository.InsertAsync(activityEvent);
            }

            if (validEvents.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            result.AcceptedCount = result.CreatedEventIds.Count;
            result.RejectedCount = result.Errors.Count;
            result.DetectionSummary = await RunDetectionAsync(tenantId, validEvents);

            return result;
        }

        private async Task<IngestionDetectionSummaryDto> RunDetectionAsync(
            int tenantId,
            IReadOnlyCollection<ActivityEvent> acceptedEvents)
        {
            var summary = new IngestionDetectionSummaryDto();
            if (acceptedEvents == null || acceptedEvents.Count == 0)
            {
                return summary;
            }

            var createdAlertIds = new HashSet<Guid>();
            var anchors = acceptedEvents
                .GroupBy(x => new { x.EventType, x.EventTime })
                .Select(group => new DetectionAnchor(group.Key.EventType, group.Key.EventTime))
                .OrderBy(x => x.EventTimeUtc)
                .ThenBy(x => x.EventType)
                .ToList();

            foreach (var anchor in anchors)
            {
                var evaluation = await _thresholdRuleEvaluator.EvaluateAsync(
                    tenantId,
                    anchor.EventTimeUtc,
                    eventType: anchor.EventType);

                await MergeDetectionEvaluationAsync(
                    summary,
                    createdAlertIds,
                    evaluation.CreatedAlertIds,
                    evaluation.DuplicateAlertCount);
            }

            var outOfHoursAnchors = acceptedEvents
                .Where(IsRiskyOutOfHoursCandidate)
                .Select(x => x.EventTime)
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            foreach (var anchor in outOfHoursAnchors)
            {
                var evaluation = await _outOfHoursRuleEvaluator.EvaluateAsync(tenantId, anchor);

                await MergeDetectionEvaluationAsync(
                    summary,
                    createdAlertIds,
                    evaluation.CreatedAlertIds,
                    evaluation.DuplicateAlertCount);
            }

            var repeatedFailureAnchors = acceptedEvents
                .Where(x => !x.IsSuccess)
                .Select(x => x.EventTime)
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            foreach (var anchor in repeatedFailureAnchors)
            {
                var evaluation = await _repeatedFailureEvaluator.EvaluateAsync(tenantId, anchor);

                await MergeDetectionEvaluationAsync(
                    summary,
                    createdAlertIds,
                    evaluation.CreatedAlertIds,
                    evaluation.DuplicateAlertCount);
            }

            var privilegedActionAnchors = acceptedEvents
                .Where(IsPrivilegedActionCandidate)
                .Select(x => x.EventTime)
                .Distinct()
                .OrderBy(x => x)
                .ToList();

            foreach (var anchor in privilegedActionAnchors)
            {
                var evaluation = await _privilegedActionEvaluator.EvaluateAsync(tenantId, anchor);

                await MergeDetectionEvaluationAsync(
                    summary,
                    createdAlertIds,
                    evaluation.CreatedAlertIds,
                    evaluation.DuplicateAlertCount);
            }

            summary.CreatedAlertIds = createdAlertIds.OrderBy(x => x).ToList();
            summary.CreatedAlertCount = summary.CreatedAlertIds.Count;

            return summary;
        }

        private async Task MergeDetectionEvaluationAsync(
            IngestionDetectionSummaryDto summary,
            ISet<Guid> createdAlertIds,
            IReadOnlyCollection<Guid> newAlertIds,
            int duplicateAlertCount)
        {
            summary.EvaluatedAnchorCount++;
            summary.DuplicateAlertCount += duplicateAlertCount;

            foreach (var alertId in newAlertIds)
            {
                createdAlertIds.Add(alertId);
            }

            if (newAlertIds.Count > 0)
            {
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        private static bool IsRiskyOutOfHoursCandidate(ActivityEvent activityEvent)
        {
            return activityEvent.IsOutOfHours &&
                   (activityEvent.EventType == ActivityEventType.Write ||
                    activityEvent.EventType == ActivityEventType.PrivilegedAction);
        }

        private static bool IsPrivilegedActionCandidate(ActivityEvent activityEvent)
        {
            return activityEvent.EventType == ActivityEventType.PrivilegedAction ||
                   activityEvent.EventType == ActivityEventType.PermissionChange;
        }

        private static IReadOnlyList<ActivityEventIngestionItemDto> GetValidatedActivityEventBatchItems(IngestActivityEventsInput input)
        {
            if (input == null)
            {
                throw new UserFriendlyException("Batch import payload is required.");
            }

            if (input.Events == null || input.Events.Count == 0)
            {
                throw new UserFriendlyException("Batch import payload must include at least one activity event.");
            }

            EnsureBatchSizeWithinLimit(input.Events.Count, "activity events");

            return input.Events;
        }

        private static IReadOnlyList<AbpAuditLogIngestionItemDto> GetValidatedAuditLogBatchItems(IngestAbpAuditLogsInput input)
        {
            if (input == null)
            {
                throw new UserFriendlyException("Audit log import payload is required.");
            }

            if (input.AbpAuditLogs == null || input.AbpAuditLogs.Count == 0)
            {
                throw new UserFriendlyException("Audit log import payload must include at least one audit log item.");
            }

            EnsureBatchSizeWithinLimit(input.AbpAuditLogs.Count, "audit log items");

            return input.AbpAuditLogs;
        }

        private static void EnsureBatchSizeWithinLimit(int count, string batchItemDescription)
        {
            if (count > MaxBatchSize)
            {
                throw new UserFriendlyException($"Batch size cannot exceed {MaxBatchSize} {batchItemDescription}.");
            }
        }

        private async Task<Dictionary<Guid, MonitoredServer>> LoadServersAsync(
            int tenantId,
            IReadOnlyCollection<ActivityEventIngestionItemDto> items)
        {
            var serverIds = items
                .Where(x => x?.ServerId.HasValue == true)
                .Select(x => x.ServerId.Value)
                .Distinct()
                .ToList();

            return serverIds.Count == 0
                ? new Dictionary<Guid, MonitoredServer>()
                : await _monitoredServerRepository.GetAll()
                    .Where(x => x.TenantId == tenantId && serverIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id);
        }

        private async Task<Dictionary<Guid, MonitoredDatabase>> LoadDatabasesAsync(
            int tenantId,
            IReadOnlyCollection<ActivityEventIngestionItemDto> items)
        {
            var databaseIds = items
                .Where(x => x?.DatabaseId.HasValue == true)
                .Select(x => x.DatabaseId.Value)
                .Distinct()
                .ToList();

            return databaseIds.Count == 0
                ? new Dictionary<Guid, MonitoredDatabase>()
                : await _monitoredDatabaseRepository.GetAll()
                    .Where(x => x.TenantId == tenantId && databaseIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id);
        }

        private static List<string> ValidateAuditLogItem(AbpAuditLogIngestionItemDto item, int tenantId)
        {
            var errors = new List<string>();

            if (item == null)
            {
                errors.Add("Audit log payload is required.");
                return errors;
            }

            if (!item.ExecutionTime.HasValue || item.ExecutionTime == DateTime.MinValue)
            {
                errors.Add("ExecutionTime is required.");
            }

            if (item.ExecutionDuration.HasValue && item.ExecutionDuration.Value < 0)
            {
                errors.Add("ExecutionDuration cannot be negative.");
            }

            if (item.TenantId.HasValue && item.TenantId.Value != tenantId)
            {
                errors.Add("TenantId does not match the active tenant context.");
            }

            return errors;
        }

        private static List<string> ValidateItem(
            ActivityEventIngestionItemDto item,
            IReadOnlyDictionary<Guid, MonitoredServer> servers,
            IReadOnlyDictionary<Guid, MonitoredDatabase> databases)
        {
            var errors = new List<string>();

            if (item == null)
            {
                errors.Add("Event payload is required.");
                return errors;
            }

            if (!item.EventTime.HasValue || item.EventTime == DateTime.MinValue)
            {
                errors.Add("EventTime is required.");
            }

            if (!item.EventType.HasValue)
            {
                errors.Add("EventType is required.");
            }

            if (item.ActorUser.IsNullOrWhiteSpace())
            {
                errors.Add("ActorUser is required.");
            }

            if (!item.Severity.HasValue)
            {
                errors.Add("Severity is required.");
            }

            if (!item.IsSuccess.HasValue)
            {
                errors.Add("IsSuccess is required.");
            }

            if (item.RowsAffected.HasValue && item.RowsAffected.Value < 0)
            {
                errors.Add("RowsAffected cannot be negative.");
            }

            if (item.DurationMs.HasValue && item.DurationMs.Value < 0)
            {
                errors.Add("DurationMs cannot be negative.");
            }

            if (item.ServerId.HasValue && !servers.ContainsKey(item.ServerId.Value))
            {
                errors.Add("ServerId does not reference a monitored server for this tenant.");
            }

            if (item.DatabaseId.HasValue && !databases.ContainsKey(item.DatabaseId.Value))
            {
                errors.Add("DatabaseId does not reference a monitored database for this tenant.");
            }

            if (item.ServerId.HasValue &&
                item.DatabaseId.HasValue &&
                databases.TryGetValue(item.DatabaseId.Value, out var database) &&
                database.ServerId != item.ServerId.Value)
            {
                errors.Add("DatabaseId does not belong to the supplied ServerId.");
            }

            return errors;
        }

        private static List<AbpAuditLogIngestionItemDto> BuildSimulatedAuditLogs(
            SeedSimulatedAbpAuditLogsInput input,
            int tenantId)
        {
            var random = input.Seed.HasValue ? new Random(input.Seed.Value) : new Random();
            var startTimeUtc = DateTime.UtcNow.AddMinutes(-Math.Max(input.Count, 15));
            var logs = new List<AbpAuditLogIngestionItemDto>(input.Count);

            for (var index = 0; index < input.Count; index++)
            {
                logs.Add(CreateSimulatedAuditLog(random, tenantId, index, startTimeUtc.AddMinutes(index), input.IncludeFailures));
            }

            return logs;
        }

        private static ActivityEventIngestionItemDto MapAuditLogItem(
            AbpAuditLogIngestionItemDto item,
            IngestAbpAuditLogsInput input)
        {
            var normalizedTime = NormalizeEventTime(item.ExecutionTime.Value);
            using var parsedParameters = TryParseJson(item.Parameters);
            var isSuccess = item.ExceptionMessage.IsNullOrWhiteSpace() && item.Exception.IsNullOrWhiteSpace();

            return new ActivityEventIngestionItemDto
            {
                ServerId = input.ServerId,
                DatabaseId = input.DatabaseId,
                EventTime = normalizedTime,
                EventType = DetermineEventType(item.ServiceName, item.MethodName),
                SourceSystem = AbpAuditLogSourceSystem,
                SourceEventKey = ResolveAuditLogSourceEventKey(item, normalizedTime),
                ActorUser = ResolveActorUser(item, parsedParameters),
                ActorIp = item.ClientIpAddress,
                ObjectName = item.ServiceName,
                Operation = item.MethodName,
                DurationMs = item.ExecutionDuration,
                IsOutOfHours = DetermineIsOutOfHours(normalizedTime),
                Severity = DetermineSeverity(item, isSuccess),
                IsSuccess = isSuccess,
                FailureReason = isSuccess ? null : FirstNonEmpty(item.ExceptionMessage, item.Exception),
                Evidence = BuildAuditLogEvidence(item)
            };
        }

        private static string NormalizeOptional(string value, int maxLength)
        {
            if (value.IsNullOrWhiteSpace())
            {
                return null;
            }

            var trimmed = value.Trim();
            return trimmed.Length <= maxLength ? trimmed : trimmed.Substring(0, maxLength);
        }

        private static string NormalizeOperation(string operation)
        {
            var normalized = NormalizeOptional(operation, DataSentinelConsts.OperationMaxLength);
            return normalized?.ToUpperInvariant();
        }

        private static string NormalizeSourceSystem(string sourceSystem)
        {
            return NormalizeOptional(sourceSystem, DataSentinelConsts.SourceSystemMaxLength) ?? BatchImportSourceSystem;
        }

        private static string ResolveSourceEventKey(
            ActivityEventIngestionItemDto item,
            string normalizedSourceSystem,
            DateTime normalizedEventTime,
            string normalizedActorUser,
            string normalizedActorIp,
            string normalizedObjectName,
            string normalizedOperation,
            string normalizedFailureReason,
            string sanitizedEvidenceJson)
        {
            var providedKey = NormalizeOptional(item.SourceEventKey, DataSentinelConsts.SourceEventKeyMaxLength);
            if (!providedKey.IsNullOrWhiteSpace())
            {
                return providedKey;
            }

            var fingerprintInput = string.Join("|", new[]
            {
                normalizedSourceSystem,
                normalizedEventTime.ToUniversalTime().ToString("O"),
                item.EventType?.ToString() ?? string.Empty,
                normalizedActorUser ?? string.Empty,
                normalizedActorIp ?? string.Empty,
                normalizedObjectName ?? string.Empty,
                normalizedOperation ?? string.Empty,
                item.ServerId?.ToString() ?? string.Empty,
                item.DatabaseId?.ToString() ?? string.Empty,
                item.RowsAffected?.ToString() ?? string.Empty,
                item.DurationMs?.ToString() ?? string.Empty,
                item.Severity?.ToString() ?? string.Empty,
                item.IsSuccess?.ToString() ?? string.Empty,
                normalizedFailureReason ?? string.Empty,
                sanitizedEvidenceJson ?? string.Empty
            });

            return DataSentinelHashingHelper.ComputeSha256(fingerprintInput);
        }

        private static string ResolveAuditLogSourceEventKey(AbpAuditLogIngestionItemDto item, DateTime normalizedTime)
        {
            if (item.Id.HasValue)
            {
                return NormalizeOptional(item.Id.Value.ToString(), DataSentinelConsts.SourceEventKeyMaxLength);
            }

            var fingerprintInput = string.Join("|", new[]
            {
                item.TenantId?.ToString() ?? string.Empty,
                item.UserId?.ToString() ?? string.Empty,
                normalizedTime.ToUniversalTime().ToString("O"),
                item.ServiceName ?? string.Empty,
                item.MethodName ?? string.Empty,
                item.ClientIpAddress ?? string.Empty,
                item.Parameters ?? string.Empty,
                item.ExceptionMessage ?? string.Empty,
                item.Exception ?? string.Empty
            });

            return DataSentinelHashingHelper.ComputeSha256(fingerprintInput);
        }

        private static string ComposeSourceIdentity(string normalizedSourceSystem, string normalizedSourceEventKey)
        {
            return $"{normalizedSourceSystem}:{normalizedSourceEventKey}";
        }

        private static int ResolveSourceIndex(IReadOnlyList<int> sourceIndexes, int index)
        {
            return sourceIndexes == null || index >= sourceIndexes.Count
                ? index
                : sourceIndexes[index];
        }

        private static DateTime NormalizeEventTime(DateTime value)
        {
            if (value.Kind == DateTimeKind.Unspecified)
            {
                return DateTime.SpecifyKind(value, DateTimeKind.Utc);
            }

            return value.ToUniversalTime();
        }

        private static bool DetermineIsOutOfHours(DateTime value)
        {
            var localTime = value.Kind == DateTimeKind.Utc ? value.ToLocalTime() : value;
            return localTime.DayOfWeek == DayOfWeek.Saturday ||
                   localTime.DayOfWeek == DayOfWeek.Sunday ||
                   localTime.Hour < 6 ||
                   localTime.Hour >= 18;
        }

        private static ActivityEventType DetermineEventType(string serviceName, string methodName)
        {
            var service = (serviceName ?? string.Empty).ToLowerInvariant();
            var method = (methodName ?? string.Empty).ToLowerInvariant();

            if (ContainsAny(method, "authenticate", "login", "signin", "sign-in", "logon"))
            {
                return ActivityEventType.Login;
            }

            if (ContainsAny(method, "logout", "signout", "sign-out", "logoff"))
            {
                return ActivityEventType.Logout;
            }

            if (ContainsAny(method, "delete", "remove", "purge"))
            {
                return ActivityEventType.Delete;
            }

            if (ContainsAny(method, "grant", "revoke", "permission", "role") &&
                ContainsAny(method, "set", "change", "assign", "update", "create", "delete"))
            {
                return ActivityEventType.PermissionChange;
            }

            if (ContainsAny(method, "schema", "migrate", "migration"))
            {
                return ActivityEventType.SchemaChange;
            }

            if (ContainsAny(method, "bulk", "import", "export"))
            {
                return ActivityEventType.BulkOperation;
            }

            if ((service.Contains("user") || service.Contains("role") || service.Contains("tenant")) &&
                ContainsAny(method, "create", "update", "delete", "register", "reset"))
            {
                return ActivityEventType.PrivilegedAction;
            }

            if (ContainsAny(method, "register", "create", "insert", "update", "save", "setcookie", "generate"))
            {
                return ActivityEventType.Write;
            }

            if (ContainsAny(method, "get", "find", "read", "index", "detail", "list", "overview", "all", "paged", "available"))
            {
                return ActivityEventType.Read;
            }

            return ActivityEventType.Other;
        }

        private static ActivitySeverity DetermineSeverity(AbpAuditLogIngestionItemDto item, bool isSuccess)
        {
            var eventType = DetermineEventType(item.ServiceName, item.MethodName);

            if (!isSuccess)
            {
                if (eventType == ActivityEventType.Login)
                {
                    return ActivitySeverity.Medium;
                }

                if (eventType == ActivityEventType.PermissionChange ||
                    eventType == ActivityEventType.PrivilegedAction ||
                    eventType == ActivityEventType.Delete ||
                    eventType == ActivityEventType.SchemaChange)
                {
                    return ActivitySeverity.High;
                }

                return ActivitySeverity.Medium;
            }

            if (eventType == ActivityEventType.PermissionChange ||
                eventType == ActivityEventType.PrivilegedAction ||
                eventType == ActivityEventType.SchemaChange)
            {
                return ActivitySeverity.High;
            }

            if (eventType == ActivityEventType.Delete ||
                eventType == ActivityEventType.BulkOperation ||
                eventType == ActivityEventType.Write ||
                eventType == ActivityEventType.Login)
            {
                return ActivitySeverity.Low;
            }

            return ActivitySeverity.Info;
        }

        private static string ResolveActorUser(AbpAuditLogIngestionItemDto item, JsonDocument parsedParameters)
        {
            var parameterUser = ExtractString(parsedParameters, "userNameOrEmailAddress") ??
                                ExtractString(parsedParameters, "usernameOrEmailAddress") ??
                                ExtractString(parsedParameters, "userName") ??
                                ExtractString(parsedParameters, "username") ??
                                ExtractString(parsedParameters, "emailAddress") ??
                                ExtractString(parsedParameters, "email");

            return NormalizeOptional(
                       parameterUser ??
                       (item.UserId.HasValue ? $"user:{item.UserId.Value}" : null) ??
                       item.ClientName ??
                       "anonymous",
                       DataSentinelConsts.ActorUserMaxLength) ??
                   "anonymous";
        }

        private static Dictionary<string, string> BuildAuditLogEvidence(AbpAuditLogIngestionItemDto item)
        {
            var evidence = new Dictionary<string, string>
            {
                ["auditLogId"] = item.Id?.ToString(),
                ["sourceTenantId"] = item.TenantId?.ToString(),
                ["sourceUserId"] = item.UserId?.ToString(),
                ["serviceName"] = item.ServiceName,
                ["methodName"] = item.MethodName,
                ["parameters"] = item.Parameters,
                ["returnValue"] = item.ReturnValue,
                ["clientName"] = item.ClientName,
                ["browserInfo"] = item.BrowserInfo,
                ["exception"] = item.Exception,
                ["customData"] = item.CustomData,
                ["impersonatorUserId"] = item.ImpersonatorUserId?.ToString(),
                ["impersonatorTenantId"] = item.ImpersonatorTenantId?.ToString()
            };

            return evidence
                .Where(x => !x.Value.IsNullOrWhiteSpace())
                .ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
        }

        private static AbpAuditLogIngestionItemDto CreateSimulatedAuditLog(
            Random random,
            int tenantId,
            int index,
            DateTime executionTimeUtc,
            bool includeFailures)
        {
            var scenario = index % 8;

            return scenario switch
            {
                0 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = null,
                    ServiceName = "Team2GroupProject.Web.Host.Controllers.HomeController",
                    MethodName = "Index",
                    Parameters = "{}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(4, 30),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("landing-page")
                },
                1 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = null,
                    ServiceName = "Team2GroupProject.Web.Host.Controllers.AntiForgeryController",
                    MethodName = "SetCookie",
                    Parameters = "{}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(1, 25),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("anti-forgery")
                },
                2 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = random.Next(0, 3) == 0 ? null : tenantId,
                    UserId = null,
                    ServiceName = "Team2GroupProject.Authorization.Accounts.AccountAppService",
                    MethodName = "IsTenantAvailable",
                    Parameters = "{\"input\":{\"tenancyName\":\"Default\"}}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(550, 950),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("tenant-check")
                },
                3 => CreateSimulatedAuthenticateAuditLog(random, tenantId, index, executionTimeUtc, includeFailures),
                4 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = 2,
                    ServiceName = "Abp.AspNetCore.Mvc.Controllers.AbpUserConfigurationController",
                    MethodName = "GetAll",
                    Parameters = "{}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(8, 3500),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("user-config")
                },
                5 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = 2,
                    ServiceName = "Team2GroupProject.Users.UserAppService",
                    MethodName = "GetAllAsync",
                    Parameters = "{\"input\":{\"keyword\":null,\"isActive\":null,\"skipCount\":0,\"maxResultCount\":100}}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(1200, 2600),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("user-list")
                },
                6 => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = 2,
                    ServiceName = "Team2GroupProject.DataSentinel.AlertsAppService",
                    MethodName = "GetPagedAlertsAsync",
                    Parameters = "{\"input\":{\"keyword\":null,\"severity\":null,\"status\":null,\"openOnly\":true,\"skipCount\":0,\"maxResultCount\":50}}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(850, 1800),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("alerts-page")
                },
                _ => new AbpAuditLogIngestionItemDto
                {
                    Id = index + 1,
                    TenantId = tenantId,
                    UserId = 2,
                    ServiceName = "Team2GroupProject.DataSentinel.DashboardsAppService",
                    MethodName = "GetOverviewAsync",
                    Parameters = "{\"input\":{\"windowDays\":7}}",
                    ExecutionTime = executionTimeUtc,
                    ExecutionDuration = random.Next(2200, 3600),
                    ClientIpAddress = "::1",
                    BrowserInfo = SimulatedBrowserInfo(),
                    CustomData = SimulatedCustomData("dashboard")
                }
            };
        }

        private static AbpAuditLogIngestionItemDto CreateSimulatedAuthenticateAuditLog(
            Random random,
            int tenantId,
            int index,
            DateTime executionTimeUtc,
            bool includeFailures)
        {
            var isFailure = includeFailures && index % 5 == 3;
            var userName = isFailure ? "string" : (index % 2 == 0 ? "admin" : "hash");

            return new AbpAuditLogIngestionItemDto
            {
                Id = index + 1,
                TenantId = isFailure ? (int?)null : tenantId,
                UserId = isFailure ? null : (index % 2 == 0 ? 2 : 5),
                ServiceName = "Team2GroupProject.Controllers.TokenAuthController",
                MethodName = "Authenticate",
                Parameters = $"{{\"model\":{{\"userNameOrEmailAddress\":\"{userName}\",\"password\":\"seeded-password-{index}\",\"rememberClient\":{(index % 2 == 0 ? "true" : "false")}}}}}",
                ExecutionTime = executionTimeUtc,
                ExecutionDuration = random.Next(3200, 6800),
                ClientIpAddress = "::1",
                BrowserInfo = SimulatedBrowserInfo(),
                ExceptionMessage = isFailure ? "Login failed!" : null,
                Exception = isFailure ? "Abp.UI.UserFriendlyException: Login failed!" : null,
                CustomData = SimulatedCustomData(isFailure ? "login-failure" : "login-success")
            };
        }

        private static string SimulatedBrowserInfo()
        {
            return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0";
        }

        private static string SimulatedCustomData(string scenario)
        {
            return $"{{\"simulationSource\":\"seeded-abp-audit-log\",\"scenario\":\"{scenario}\"}}";
        }

        private static bool ContainsAny(string value, params string[] fragments)
        {
            return fragments.Any(fragment => value.Contains(fragment));
        }

        private static string FirstNonEmpty(params string[] values)
        {
            foreach (var value in values)
            {
                if (!value.IsNullOrWhiteSpace())
                {
                    return value;
                }
            }

            return null;
        }

        private static JsonDocument TryParseJson(string json)
        {
            if (json.IsNullOrWhiteSpace())
            {
                return null;
            }

            try
            {
                return JsonDocument.Parse(json);
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private static string ExtractString(JsonDocument document, string propertyName)
        {
            if (document == null)
            {
                return null;
            }

            return ExtractString(document.RootElement, propertyName);
        }

        private static string ExtractString(JsonElement element, string propertyName)
        {
            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var property in element.EnumerateObject())
                {
                    if (string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase))
                    {
                        return property.Value.ValueKind == JsonValueKind.String
                            ? property.Value.GetString()
                            : property.Value.ToString();
                    }

                    var nestedValue = ExtractString(property.Value, propertyName);
                    if (!nestedValue.IsNullOrWhiteSpace())
                    {
                        return nestedValue;
                    }
                }
            }

            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    var nestedValue = ExtractString(item, propertyName);
                    if (!nestedValue.IsNullOrWhiteSpace())
                    {
                        return nestedValue;
                    }
                }
            }

            return null;
        }

        private static string SanitizeEvidence(IReadOnlyDictionary<string, string> evidence)
        {
            if (evidence == null || evidence.Count == 0)
            {
                return null;
            }

            var sanitized = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var entry in evidence.Take(MaxEvidenceEntries))
            {
                var key = NormalizeOptional(entry.Key, MaxEvidenceKeyLength);
                if (key.IsNullOrWhiteSpace())
                {
                    continue;
                }

                sanitized[key] = IsSensitiveEvidenceKey(key)
                    ? RedactedValue
                    : SanitizeEvidenceValue(entry.Value);
            }

            return sanitized.Count == 0 ? null : JsonSerializer.Serialize(sanitized);
        }

        private static string SanitizeEvidenceValue(string value)
        {
            var normalized = NormalizeOptional(value, MaxEvidenceValueLength * 4);
            if (normalized.IsNullOrWhiteSpace())
            {
                return null;
            }

            var sanitizedJson = TryRedactJsonValue(normalized);
            return NormalizeOptional(sanitizedJson ?? normalized, MaxEvidenceValueLength);
        }

        private static string TryRedactJsonValue(string value)
        {
            try
            {
                using var document = JsonDocument.Parse(value);
                using var stream = new MemoryStream();
                using var writer = new Utf8JsonWriter(stream);

                WriteSanitizedJson(writer, document.RootElement, null);
                writer.Flush();

                return Encoding.UTF8.GetString(stream.ToArray());
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private static void WriteSanitizedJson(Utf8JsonWriter writer, JsonElement element, string currentPropertyName)
        {
            if (currentPropertyName != null && IsSensitiveEvidenceKey(currentPropertyName))
            {
                writer.WriteStringValue(RedactedValue);
                return;
            }

            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    writer.WriteStartObject();
                    foreach (var property in element.EnumerateObject())
                    {
                        writer.WritePropertyName(property.Name);
                        WriteSanitizedJson(writer, property.Value, property.Name);
                    }
                    writer.WriteEndObject();
                    break;
                case JsonValueKind.Array:
                    writer.WriteStartArray();
                    foreach (var item in element.EnumerateArray())
                    {
                        WriteSanitizedJson(writer, item, currentPropertyName);
                    }
                    writer.WriteEndArray();
                    break;
                default:
                    element.WriteTo(writer);
                    break;
            }
        }

        private static bool IsSensitiveEvidenceKey(string key)
        {
            return SensitiveEvidenceFragments.Any(fragment =>
                key.IndexOf(fragment, StringComparison.OrdinalIgnoreCase) >= 0);
        }

        // ── Query endpoints ────────────────────────────────────────────────────

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_ActivityEvents_View)]
        public async Task<PagedResultDto<ActivityEventDto>> GetPagedAsync(GetActivityEventsInput input)
        {
            var tenantId = AbpSession.GetTenantId();

            var query = BuildFilteredQuery(tenantId, input);

            var totalCount = await query.CountAsync();

            var ordered = input.SortDescending
                ? query.OrderByDescending(x => x.EventTime)
                : query.OrderBy(x => x.EventTime);

            var rows = await (
                from e in ordered.Skip(input.SkipCount).Take(input.MaxResultCount)
                join d in _monitoredDatabaseRepository.GetAll() on e.DatabaseId equals d.Id into databaseJoin
                from db in databaseJoin.DefaultIfEmpty()
                select new { Event = e, DatabaseName = (string)db.Name }
            ).ToListAsync();

            var items = rows.Select(x => MapToDto(x.Event, x.DatabaseName)).ToList();

            return new PagedResultDto<ActivityEventDto>(totalCount, items);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_ActivityEvents_View)]
        public async Task<ActivityEventSummaryDto> GetSummaryAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            var events = _activityEventRepository.GetAll().Where(x => x.TenantId == tenantId);

            var summary = await events
                .GroupBy(_ => 1)
                .Select(g => new ActivityEventSummaryDto
                {
                    TotalEvents = g.Count(),
                    ReadOps = g.Count(x => x.EventType == ActivityEventType.Read),
                    WriteOps = g.Count(x => x.EventType == ActivityEventType.Write),
                    AuthEvents = g.Count(x => x.EventType == ActivityEventType.Login || x.EventType == ActivityEventType.Logout),
                    PrivilegedOps = g.Count(x => x.EventType == ActivityEventType.PrivilegedAction),
                    SuspiciousActivityCount = g.Count(x => x.Severity >= ActivitySeverity.Medium),
                    FailedEventsCount = g.Count(x => !x.IsSuccess)
                })
                .FirstOrDefaultAsync();

            return summary ?? new ActivityEventSummaryDto();
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_ActivityEvents_View)]
        public async Task<ActivityEventFilterOptionsDto> GetFilterOptionsAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            var events = _activityEventRepository.GetAll().Where(x => x.TenantId == tenantId);

            var databaseIds = await events
                .Where(x => x.DatabaseId.HasValue)
                .Select(x => x.DatabaseId.Value)
                .Distinct()
                .ToListAsync();

            var databases = await _monitoredDatabaseRepository.GetAll()
                .Where(x => x.TenantId == tenantId && databaseIds.Contains(x.Id))
                .OrderBy(x => x.Name)
                .Select(x => new DatabaseOptionDto { Id = x.Id, Name = x.Name })
                .ToListAsync();

            var serverIds = await events
                .Where(x => x.ServerId.HasValue)
                .Select(x => x.ServerId.Value)
                .Distinct()
                .ToListAsync();

            var servers = await _monitoredServerRepository.GetAll()
                .Where(x => x.TenantId == tenantId && serverIds.Contains(x.Id))
                .OrderBy(x => x.Name)
                .Select(x => new ServerOptionDto { Id = x.Id, Name = x.Name })
                .ToListAsync();

            var users = await events
                .Where(x => !string.IsNullOrEmpty(x.ActorUser))
                .Select(x => x.ActorUser)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            var ipAddresses = await events
                .Where(x => !string.IsNullOrEmpty(x.ActorIp))
                .Select(x => x.ActorIp)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            var operations = await events
                .Where(x => !string.IsNullOrEmpty(x.Operation))
                .Select(x => x.Operation)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return new ActivityEventFilterOptionsDto
            {
                Databases = databases,
                Servers = servers,
                Users = users,
                IpAddresses = ipAddresses,
                Operations = operations
            };
        }

        private IQueryable<ActivityEvent> BuildFilteredQuery(int tenantId, GetActivityEventsInput input)
        {
            var query = _activityEventRepository.GetAll().Where(x => x.TenantId == tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                var keyword = input.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    (x.ActorUser != null && x.ActorUser.ToLower().Contains(keyword)) ||
                    (x.ObjectName != null && x.ObjectName.ToLower().Contains(keyword)) ||
                    (x.Operation != null && x.Operation.ToLower().Contains(keyword)) ||
                    (x.FailureReason != null && x.FailureReason.ToLower().Contains(keyword)));
            }

            if (input.StartDate.HasValue)
            {
                query = query.Where(x => x.EventTime >= input.StartDate.Value);
            }

            if (input.EndDate.HasValue)
            {
                query = query.Where(x => x.EventTime <= input.EndDate.Value);
            }

            if (input.EventType.HasValue)
            {
                query = query.Where(x => x.EventType == input.EventType.Value);
            }

            if (input.Severity.HasValue)
            {
                query = query.Where(x => x.Severity == input.Severity.Value);
            }

            if (input.DatabaseId.HasValue)
            {
                query = query.Where(x => x.DatabaseId == input.DatabaseId.Value);
            }

            if (input.ServerId.HasValue)
            {
                query = query.Where(x => x.ServerId == input.ServerId.Value);
            }

            if (!input.ActorUser.IsNullOrWhiteSpace())
            {
                query = query.Where(x => x.ActorUser == input.ActorUser.Trim());
            }

            if (!input.ActorIp.IsNullOrWhiteSpace())
            {
                query = query.Where(x => x.ActorIp == input.ActorIp.Trim());
            }

            if (!input.Operation.IsNullOrWhiteSpace())
            {
                query = query.Where(x => x.Operation == input.Operation.Trim().ToUpperInvariant());
            }

            if (input.IsSuccess.HasValue)
            {
                query = query.Where(x => x.IsSuccess == input.IsSuccess.Value);
            }

            query = input.Tab switch
            {
                ActivityEventTab.SuspiciousActivity => query.Where(x => x.Severity >= ActivitySeverity.Medium),
                ActivityEventTab.FailedEvents => query.Where(x => !x.IsSuccess),
                _ => query
            };

            return query;
        }

        private static ActivityEventDto MapToDto(ActivityEvent e, string databaseName)
        {
            return new ActivityEventDto
            {
                Id = e.Id,
                EventId = $"EVT-{e.EventTime:yyyyMMdd-HHmmss}",
                EventTime = e.EventTime,
                EventType = e.EventType,
                Severity = e.Severity,
                ActorUser = e.ActorUser,
                ActorIp = e.ActorIp,
                ObjectName = e.ObjectName,
                Operation = e.Operation,
                RowsAffected = e.RowsAffected,
                DurationMs = e.DurationMs,
                IsOutOfHours = e.IsOutOfHours,
                IsSuccess = e.IsSuccess,
                FailureReason = e.FailureReason,
                DatabaseId = e.DatabaseId,
                DatabaseName = databaseName,
                ServerId = e.ServerId,
                QueryPreview = BuildQueryPreview(e.Operation, e.ObjectName)
            };
        }

        private static string BuildQueryPreview(string operation, string objectName)
        {
            if (operation.IsNullOrWhiteSpace())
            {
                return null;
            }

            return objectName.IsNullOrWhiteSpace()
                ? operation
                : $"{operation} {objectName}";
        }

        private sealed class DetectionAnchor
        {
            public DetectionAnchor(ActivityEventType eventType, DateTime eventTimeUtc)
            {
                EventType = eventType;
                EventTimeUtc = eventTimeUtc;
            }

            public ActivityEventType EventType { get; }

            public DateTime EventTimeUtc { get; }
        }
    }
}
