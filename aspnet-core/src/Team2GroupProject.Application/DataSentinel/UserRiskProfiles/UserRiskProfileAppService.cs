using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Extensions;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.UserRiskProfiles.Dto;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Dashboard)]
    public class UserRiskProfileAppService : Team2GroupProjectAppServiceBase, IUserRiskProfileAppService
    {
        private readonly IUserRiskProfileRepository _userRiskProfileRepository;

        public UserRiskProfileAppService(IUserRiskProfileRepository userRiskProfileRepository)
        {
            _userRiskProfileRepository = userRiskProfileRepository;
        }

        public async Task<PagedResultDto<UserRiskProfileDto>> GetPagedAsync(GetUserRiskProfilesInput input)
        {
            var tenantId = AbpSession.TenantId!.Value;
            var query = BuildFilteredQuery(tenantId, input);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(x => x.RiskScore)
                .ThenByDescending(x => x.AlertCount)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .Select(x => MapToDto(x))
                .ToListAsync();

            return new PagedResultDto<UserRiskProfileDto>(totalCount, items);
        }

        public async Task<UserRiskProfileDto> GetByIdAsync(Guid id)
        {
            var tenantId = AbpSession.TenantId!.Value;

            var profile = await _userRiskProfileRepository.GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);

            if (profile == null)
            {
                throw new UserFriendlyException("User risk profile not found.");
            }

            return MapToDto(profile);
        }

        public async Task<UserRiskProfileSummaryDto> GetSummaryAsync()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var profiles = _userRiskProfileRepository.GetAll().Where(x => x.TenantId == tenantId);

            var totalUsers = await profiles.CountAsync();
            var highRiskUsers = await profiles.CountAsync(x =>
                x.RiskLevel == UserRiskLevel.High || x.RiskLevel == UserRiskLevel.Critical);
            var totalAlerts = await profiles.SumAsync(x => (int?)x.AlertCount) ?? 0;

            return new UserRiskProfileSummaryDto
            {
                TotalUsers = totalUsers,
                HighRiskUsers = highRiskUsers,
                TotalAlerts = totalAlerts
            };
        }

        private IQueryable<UserRiskProfile> BuildFilteredQuery(int tenantId, GetUserRiskProfilesInput input)
        {
            var query = _userRiskProfileRepository.GetAll().Where(x => x.TenantId == tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                var keyword = input.Keyword.Trim().ToLower();
                query = query.Where(x => x.ActorUser.ToLower().Contains(keyword));
            }

            if (input.RiskLevel.HasValue)
            {
                query = query.Where(x => x.RiskLevel == input.RiskLevel.Value);
            }

            if (input.MinRiskScore.HasValue)
            {
                query = query.Where(x => x.RiskScore >= input.MinRiskScore.Value);
            }

            if (input.MaxRiskScore.HasValue)
            {
                query = query.Where(x => x.RiskScore <= input.MaxRiskScore.Value);
            }

            return query;
        }

        private static UserRiskProfileDto MapToDto(UserRiskProfile profile)
        {
            return new UserRiskProfileDto
            {
                Id = profile.Id,
                ActorUser = profile.ActorUser,
                ActorIp = profile.ActorIp,
                RiskScore = profile.RiskScore,
                RiskLevel = profile.RiskLevel,
                AlertCount = profile.AlertCount,
                HighSeverityAlertCount = profile.HighSeverityAlertCount,
                FailedLoginCount = profile.FailedLoginCount,
                PrivilegedActionCount = profile.PrivilegedActionCount,
                OutOfHoursEventCount = profile.OutOfHoursEventCount,
                LastEvaluatedAt = profile.LastEvaluatedAt
            };
        }
    }
}
