using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_View)]
    public class IncidentNoteAppService : Team2GroupProjectAppServiceBase, IIncidentNoteAppService
    {
        private readonly IIncidentNoteRepository _incidentNoteRepository;
        private readonly ISecurityAlertRepository _securityAlertRepository;

        public IncidentNoteAppService(
            IIncidentNoteRepository incidentNoteRepository,
            ISecurityAlertRepository securityAlertRepository)
        {
            _incidentNoteRepository = incidentNoteRepository;
            _securityAlertRepository = securityAlertRepository;
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_Review)]
        public async Task<IncidentNoteDto> CreateAsync(CreateIncidentNoteInput input)
        {
            if (input.Body.IsNullOrWhiteSpace())
            {
                throw new UserFriendlyException("Note body is required.");
            }

            var tenantId = AbpSession.GetTenantId();

            var alertExists = await _securityAlertRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId && x.Id == input.AlertId);

            if (!alertExists)
            {
                throw new UserFriendlyException("Security alert not found.");
            }

            var note = new IncidentNote(tenantId, input.AlertId, input.Body, input.IsInternal);
            await _incidentNoteRepository.InsertAsync(note);

            var userNames = await ResolveUserNamesAsync(new[] { AbpSession.UserId });
            return MapToDto(note, userNames);
        }

        public async Task<List<IncidentNoteDto>> GetByAlertAsync(Guid alertId)
        {
            var tenantId = AbpSession.GetTenantId();

            var alertExists = await _securityAlertRepository.GetAll()
                .AnyAsync(x => x.TenantId == tenantId && x.Id == alertId);

            if (!alertExists)
            {
                throw new UserFriendlyException("Security alert not found.");
            }

            var notes = await _incidentNoteRepository.GetAll()
                .Where(x => x.AlertId == alertId)
                .OrderByDescending(x => x.CreationTime)
                .ToListAsync();

            var userNames = await ResolveUserNamesAsync(notes.Select(x => x.CreatorUserId));
            return notes.Select(x => MapToDto(x, userNames)).ToList();
        }

        private async Task<Dictionary<long, string>> ResolveUserNamesAsync(IEnumerable<long?> userIds)
        {
            var resolvedIds = userIds
                .Where(x => x.HasValue)
                .Select(x => x.Value)
                .Distinct()
                .ToList();

            if (resolvedIds.Count == 0)
            {
                return new Dictionary<long, string>();
            }

            var users = await UserManager.Users
                .Where(x => resolvedIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.UserName,
                    x.Name,
                    x.Surname
                })
                .ToListAsync();

            return users.ToDictionary(
                x => x.Id,
                x =>
                {
                    var fullName = $"{x.Name} {x.Surname}".Trim();
                    return fullName.IsNullOrWhiteSpace() ? x.UserName : fullName;
                });
        }

        private static IncidentNoteDto MapToDto(
            IncidentNote note,
            IReadOnlyDictionary<long, string> userNames)
        {
            return new IncidentNoteDto
            {
                Id = note.Id,
                AlertId = note.AlertId,
                Body = note.Body,
                IsInternal = note.IsInternal,
                CreationTime = note.CreationTime,
                CreatorUserId = note.CreatorUserId,
                CreatorUserDisplayName = note.CreatorUserId.HasValue &&
                    userNames.TryGetValue(note.CreatorUserId.Value, out var name)
                    ? name
                    : null
            };
        }
    }
}
