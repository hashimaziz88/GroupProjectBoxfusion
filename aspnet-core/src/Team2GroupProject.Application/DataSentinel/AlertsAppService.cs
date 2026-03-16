using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel.Dto;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_View)]
    public class AlertsAppService : Team2GroupProjectAppServiceBase, IAlertsAppService
    {
        private readonly IRepository<SecurityAlert, long> _securityAlertRepository;
        private readonly IRepository<AlertRule, long> _alertRuleRepository;
        private readonly IRepository<ActivityEvent, long> _activityEventRepository;
        private readonly IRepository<IncidentNote, long> _incidentNoteRepository;
        private readonly IRepository<AlertStatusHistory, long> _alertStatusHistoryRepository;
        private readonly IRepository<User, long> _userRepository;

        public AlertsAppService(
            IRepository<SecurityAlert, long> securityAlertRepository,
            IRepository<AlertRule, long> alertRuleRepository,
            IRepository<ActivityEvent, long> activityEventRepository,
            IRepository<IncidentNote, long> incidentNoteRepository,
            IRepository<AlertStatusHistory, long> alertStatusHistoryRepository,
            IRepository<User, long> userRepository)
        {
            _securityAlertRepository = securityAlertRepository;
            _alertRuleRepository = alertRuleRepository;
            _activityEventRepository = activityEventRepository;
            _incidentNoteRepository = incidentNoteRepository;
            _alertStatusHistoryRepository = alertStatusHistoryRepository;
            _userRepository = userRepository;
        }

        public async Task<PagedResultDto<SecurityAlertListDto>> GetPagedAlertsAsync(GetSecurityAlertsInput input)
        {
            input ??= new GetSecurityAlertsInput();
            var tenantId = GetTenantId();
            var normalizedKeyword = input.Keyword?.Trim();
            var normalizedActor = input.ActorUser?.Trim();
            var normalizedObject = input.ObjectName?.Trim();

            var query =
                from alert in _securityAlertRepository.GetAll()
                join rule in _alertRuleRepository.GetAll() on alert.RuleId equals rule.Id
                where alert.TenantId == tenantId && rule.TenantId == tenantId
                select new { Alert = alert, Rule = rule };

            query = query
                .WhereIf(!string.IsNullOrWhiteSpace(normalizedKeyword), item =>
                    item.Alert.Title.Contains(normalizedKeyword) ||
                    item.Alert.Summary.Contains(normalizedKeyword) ||
                    item.Rule.Name.Contains(normalizedKeyword) ||
                    item.Alert.PrimaryActorUser.Contains(normalizedKeyword) ||
                    item.Alert.PrimaryActorIp.Contains(normalizedKeyword))
                .WhereIf(input.Severity.HasValue, item => item.Alert.Severity == input.Severity.Value)
                .WhereIf(input.Status.HasValue, item => item.Alert.Status == input.Status.Value)
                .WhereIf(!string.IsNullOrWhiteSpace(normalizedActor), item => item.Alert.PrimaryActorUser.Contains(normalizedActor))
                .WhereIf(input.DateFromUtc.HasValue, item => item.Alert.EventTimeEnd >= input.DateFromUtc.Value)
                .WhereIf(input.DateToUtc.HasValue, item => item.Alert.EventTimeStart <= input.DateToUtc.Value)
                .WhereIf(input.OpenOnly == true, item =>
                    item.Alert.Status != SecurityAlertStatus.Resolved &&
                    item.Alert.Status != SecurityAlertStatus.FalsePositive);

            if (input.ServerId.HasValue || input.DatabaseId.HasValue || !string.IsNullOrWhiteSpace(normalizedObject))
            {
                query = query.Where(item =>
                    _activityEventRepository.GetAll().Any(activityEvent =>
                        activityEvent.TenantId == tenantId &&
                        activityEvent.EventTime >= item.Alert.EventTimeStart &&
                        activityEvent.EventTime <= item.Alert.EventTimeEnd &&
                        (!input.ServerId.HasValue || activityEvent.ServerId == input.ServerId.Value) &&
                        (!input.DatabaseId.HasValue || activityEvent.DatabaseId == input.DatabaseId.Value) &&
                        (string.IsNullOrWhiteSpace(normalizedObject) || activityEvent.ObjectName.Contains(normalizedObject)) &&
                        (
                            (string.IsNullOrWhiteSpace(item.Alert.PrimaryActorUser) && string.IsNullOrWhiteSpace(item.Alert.PrimaryActorIp)) ||
                            activityEvent.ActorUser == item.Alert.PrimaryActorUser ||
                            activityEvent.ActorIp == item.Alert.PrimaryActorIp
                        )));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(item => item.Alert.Severity)
                .ThenByDescending(item => item.Alert.CreationTime)
                .PageBy(input)
                .Select(item => new SecurityAlertListDto
                {
                    Id = item.Alert.Id,
                    RuleName = item.Rule.Name,
                    Title = item.Alert.Title,
                    Summary = item.Alert.Summary,
                    Severity = item.Alert.Severity,
                    Status = item.Alert.Status,
                    PrimaryActorUser = item.Alert.PrimaryActorUser,
                    PrimaryActorIp = item.Alert.PrimaryActorIp,
                    CreatedAt = item.Alert.CreationTime,
                    EventTimeStart = item.Alert.EventTimeStart,
                    EventTimeEnd = item.Alert.EventTimeEnd,
                    RelatedEventCount = item.Alert.RelatedEventCount
                })
                .ToListAsync();

            return new PagedResultDto<SecurityAlertListDto>(totalCount, items);
        }

        public async Task<SecurityAlertDetailDto> GetAlertDetailAsync(EntityDto<long> input)
        {
            return await BuildAlertDetailAsync(GetTenantId(), input.Id);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_Review)]
        public async Task<SecurityAlertDetailDto> UpdateStatusAsync(UpdateSecurityAlertStatusInput input)
        {
            var tenantId = GetTenantId();
            var alert = await _securityAlertRepository.GetAll()
                .FirstOrDefaultAsync(securityAlert => securityAlert.TenantId == tenantId && securityAlert.Id == input.AlertId);

            if (alert == null)
            {
                throw new UserFriendlyException($"Security alert {input.AlertId} was not found.");
            }

            if (alert.Status != input.Status)
            {
                var previousStatus = alert.Status;
                alert.Status = input.Status;

                await _alertStatusHistoryRepository.InsertAsync(new AlertStatusHistory
                {
                    TenantId = tenantId,
                    AlertId = alert.Id,
                    FromStatus = previousStatus,
                    ToStatus = input.Status,
                    Comment = input.Comment?.Trim()
                });

                await _securityAlertRepository.UpdateAsync(alert);
                await CurrentUnitOfWork.SaveChangesAsync();
            }

            return await BuildAlertDetailAsync(tenantId, alert.Id);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_Review)]
        public async Task<IncidentNoteDto> AddNoteAsync(CreateIncidentNoteInput input)
        {
            var tenantId = GetTenantId();
            var alertExists = await _securityAlertRepository.GetAll()
                .AnyAsync(securityAlert => securityAlert.TenantId == tenantId && securityAlert.Id == input.AlertId);

            if (!alertExists)
            {
                throw new UserFriendlyException($"Security alert {input.AlertId} was not found.");
            }

            var note = await _incidentNoteRepository.InsertAsync(new IncidentNote
            {
                TenantId = tenantId,
                AlertId = input.AlertId,
                Body = input.Body.Trim(),
                IsInternal = input.IsInternal
            });

            await CurrentUnitOfWork.SaveChangesAsync();

            var creator = note.CreatorUserId.HasValue
                ? await _userRepository.GetAll()
                    .Where(user => user.Id == note.CreatorUserId.Value)
                    .Select(user => new { user.Id, user.UserName, user.Name, user.Surname })
                    .FirstOrDefaultAsync()
                : null;

            return new IncidentNoteDto
            {
                Id = note.Id,
                CreatedAt = note.CreationTime,
                CreatedByUserId = note.CreatorUserId,
                CreatedByName = ResolveUserDisplayName(creator?.UserName, creator?.Name, creator?.Surname),
                Body = note.Body,
                IsInternal = note.IsInternal
            };
        }

        private async Task<SecurityAlertDetailDto> BuildAlertDetailAsync(int tenantId, long alertId)
        {
            var alert = await (
                from securityAlert in _securityAlertRepository.GetAll()
                join rule in _alertRuleRepository.GetAll() on securityAlert.RuleId equals rule.Id
                where securityAlert.TenantId == tenantId && rule.TenantId == tenantId && securityAlert.Id == alertId
                select new
                {
                    Alert = securityAlert,
                    Rule = rule
                }).FirstOrDefaultAsync();

            if (alert == null)
            {
                throw new UserFriendlyException($"Security alert {alertId} was not found.");
            }

            var notes = await _incidentNoteRepository.GetAll()
                .Where(note => note.TenantId == tenantId && note.AlertId == alertId)
                .OrderBy(note => note.CreationTime)
                .ToListAsync();

            var statusHistory = await _alertStatusHistoryRepository.GetAll()
                .Where(history => history.TenantId == tenantId && history.AlertId == alertId)
                .OrderBy(history => history.CreationTime)
                .ToListAsync();

            var relatedEvents = await _activityEventRepository.GetAll()
                .Where(activityEvent =>
                    activityEvent.TenantId == tenantId &&
                    activityEvent.EventTime >= alert.Alert.EventTimeStart &&
                    activityEvent.EventTime <= alert.Alert.EventTimeEnd &&
                    (
                        (string.IsNullOrWhiteSpace(alert.Alert.PrimaryActorUser) && string.IsNullOrWhiteSpace(alert.Alert.PrimaryActorIp)) ||
                        activityEvent.ActorUser == alert.Alert.PrimaryActorUser ||
                        activityEvent.ActorIp == alert.Alert.PrimaryActorIp
                    ))
                .OrderByDescending(activityEvent => activityEvent.EventTime)
                .Take(50)
                .Select(activityEvent => new SecurityAlertRelatedEventDto
                {
                    Id = activityEvent.Id,
                    ServerName = activityEvent.Server.Name,
                    DatabaseName = activityEvent.Database.Name,
                    EventTime = activityEvent.EventTime,
                    EventType = activityEvent.EventType,
                    ActorUser = activityEvent.ActorUser,
                    ActorIp = activityEvent.ActorIp,
                    ObjectName = activityEvent.ObjectName,
                    Operation = activityEvent.Operation,
                    RowsAffected = activityEvent.RowsAffected,
                    DurationMs = activityEvent.DurationMs,
                    IsSuccessful = activityEvent.IsSuccessful,
                    IsOutOfHours = activityEvent.IsOutOfHours,
                    IsPrivilegedAction = activityEvent.IsPrivilegedAction,
                    Severity = activityEvent.Severity,
                    QuerySignature = activityEvent.QuerySignature,
                    FailureReason = activityEvent.FailureReason,
                    EvidenceJson = activityEvent.EvidenceJson
                })
                .ToListAsync();

            var userMap = await BuildUserLookupAsync(
                notes.Select(note => note.CreatorUserId)
                    .Concat(statusHistory.Select(history => history.CreatorUserId))
                    .Where(userId => userId.HasValue)
                    .Select(userId => userId.Value)
                    .Distinct()
                    .ToList());

            return new SecurityAlertDetailDto
            {
                Id = alert.Alert.Id,
                RuleId = alert.Rule.Id,
                RuleName = alert.Rule.Name,
                RuleDescription = alert.Rule.Description,
                Title = alert.Alert.Title,
                Summary = alert.Alert.Summary,
                Severity = alert.Alert.Severity,
                Status = alert.Alert.Status,
                PrimaryActorUser = alert.Alert.PrimaryActorUser,
                PrimaryActorIp = alert.Alert.PrimaryActorIp,
                CreatedAt = alert.Alert.CreationTime,
                EventTimeStart = alert.Alert.EventTimeStart,
                EventTimeEnd = alert.Alert.EventTimeEnd,
                RelatedEventCount = alert.Alert.RelatedEventCount,
                TopEvidenceJson = alert.Alert.TopEvidenceJson,
                Notes = notes.Select(note => new IncidentNoteDto
                {
                    Id = note.Id,
                    CreatedAt = note.CreationTime,
                    CreatedByUserId = note.CreatorUserId,
                    CreatedByName = userMap.TryGetValue(note.CreatorUserId, out var createdByName) ? createdByName : "System",
                    Body = note.Body,
                    IsInternal = note.IsInternal
                }).ToList(),
                StatusHistory = statusHistory.Select(history => new AlertStatusHistoryDto
                {
                    Id = history.Id,
                    ChangedAt = history.CreationTime,
                    ChangedByUserId = history.CreatorUserId,
                    ChangedByName = userMap.TryGetValue(history.CreatorUserId, out var changedByName) ? changedByName : "System",
                    FromStatus = history.FromStatus,
                    ToStatus = history.ToStatus,
                    Comment = history.Comment
                }).ToList(),
                RelatedEvents = relatedEvents
            };
        }

        private async Task<Dictionary<long?, string>> BuildUserLookupAsync(IReadOnlyCollection<long> userIds)
        {
            if (userIds.Count == 0)
            {
                return new Dictionary<long?, string>();
            }

            var users = await _userRepository.GetAll()
                .Where(user => userIds.Contains(user.Id))
                .Select(user => new { user.Id, user.UserName, user.Name, user.Surname })
                .ToListAsync();

            return users.ToDictionary(
                user => (long?)user.Id,
                user => ResolveUserDisplayName(user.UserName, user.Name, user.Surname));
        }

        private int GetTenantId()
        {
            return AbpSession.TenantId ?? throw new UserFriendlyException("DataSentinel alert workflows require an active tenant context.");
        }

        private static string ResolveUserDisplayName(string userName, string name, string surname)
        {
            var fullName = $"{name} {surname}".Trim();
            if (!string.IsNullOrWhiteSpace(fullName))
            {
                return fullName;
            }

            return string.IsNullOrWhiteSpace(userName) ? "System" : userName;
        }
    }
}
