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

            return MapToDto(note);
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

            return notes.Select(MapToDto).ToList();
        }

        private static IncidentNoteDto MapToDto(IncidentNote note)
        {
            return new IncidentNoteDto
            {
                Id = note.Id,
                AlertId = note.AlertId,
                Body = note.Body,
                IsInternal = note.IsInternal,
                CreationTime = note.CreationTime,
                CreatorUserId = note.CreatorUserId
            };
        }
    }
}
