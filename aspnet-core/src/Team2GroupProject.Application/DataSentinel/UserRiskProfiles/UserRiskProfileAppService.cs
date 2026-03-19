using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.UserRiskProfiles.Dto;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Users_View)]
    public class UserRiskProfileAppService : Team2GroupProjectAppServiceBase, IUserRiskProfileAppService
    {
        private const int RecentActivityCount = 5;

        private readonly IUserRiskProfileRepository _userRiskProfileRepository;
        private readonly IActivityEventRepository _activityEventRepository;

        public UserRiskProfileAppService(
            IUserRiskProfileRepository userRiskProfileRepository,
            IActivityEventRepository activityEventRepository)
        {
            _userRiskProfileRepository = userRiskProfileRepository;
            _activityEventRepository = activityEventRepository;
        }

        public async Task<PagedResultDto<UserRiskProfileDto>> GetPagedAsync(GetUserRiskProfilesInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var query = BuildFilteredQuery(tenantId, input);

            var totalCount = await query.CountAsync();

            var profiles = await query
                .OrderByDescending(x => x.RiskScore)
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount)
                .ToListAsync();

            return new PagedResultDto<UserRiskProfileDto>(totalCount, profiles.Select(MapToDto).ToList());
        }

        public async Task<UserRiskProfileDetailDto> GetByIdAsync(Guid id)
        {
            var tenantId = AbpSession.GetTenantId();

            var profile = await _userRiskProfileRepository.GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == id);

            if (profile == null)
            {
                throw new UserFriendlyException("User risk profile not found.");
            }

            var recentEvents = await _activityEventRepository.GetAll()
                .Where(x => x.TenantId == tenantId && x.ActorUser == profile.ActorUser)
                .OrderByDescending(x => x.EventTime)
                .Take(RecentActivityCount)
                .ToListAsync();

            return new UserRiskProfileDetailDto
            {
                Id = profile.Id,
                ActorUser = profile.ActorUser,
                ActorIp = profile.ActorIp,
                RiskScore = profile.RiskScore,
                RiskLevel = profile.RiskLevel,
                Status = profile.Status,
                AlertCount = profile.AlertCount,
                FailedLoginCount = profile.FailedLoginCount,
                PrivilegedActionCount = profile.PrivilegedActionCount,
                HighSeverityAlertCount = profile.HighSeverityAlertCount,
                OutOfHoursEventCount = profile.OutOfHoursEventCount,
                TotalEventCount = profile.TotalEventCount,
                LastActivityAt = profile.LastActivityAt,
                LastEvaluatedAt = profile.LastEvaluatedAt,
                AiRiskAssessment = BuildRiskAssessment(profile),
                RecentActivity = recentEvents.Select(MapToRecentActivityItem).ToList()
            };
        }

        public async Task<UserRiskProfileSummaryDto> GetSummaryAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            var profiles = _userRiskProfileRepository.GetAll().Where(x => x.TenantId == tenantId);

            var totalUsers = await profiles.CountAsync();
            var highRiskUsers = await profiles.CountAsync(x =>
                x.RiskLevel == UserRiskLevel.High || x.RiskLevel == UserRiskLevel.Critical);
            var monitoredAccounts = await profiles.CountAsync(x => x.Status == UserProfileStatus.Monitored);
            var totalAlerts = await profiles.SumAsync(x => (int?)x.AlertCount) ?? 0;

            return new UserRiskProfileSummaryDto
            {
                TotalUsers = totalUsers,
                HighRiskUsers = highRiskUsers,
                MonitoredAccounts = monitoredAccounts,
                TotalAlerts = totalAlerts
            };
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Users_View)]
        public async Task UpdateStatusAsync(UpdateUserRiskProfileStatusInput input)
        {
            var tenantId = AbpSession.GetTenantId();

            var profile = await _userRiskProfileRepository.GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == input.ProfileId);

            if (profile == null)
            {
                throw new UserFriendlyException("User risk profile not found.");
            }

            profile.Status = input.Status;
            await _userRiskProfileRepository.UpdateAsync(profile);
        }

        private IQueryable<UserRiskProfile> BuildFilteredQuery(int tenantId, GetUserRiskProfilesInput input)
        {
            var query = _userRiskProfileRepository.GetAll().Where(x => x.TenantId == tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                var keyword = input.Keyword.Trim().ToLower();
                query = query.Where(x => x.ActorUser != null && x.ActorUser.ToLower().Contains(keyword));
            }

            if (input.RiskLevel.HasValue)
            {
                query = query.Where(x => x.RiskLevel == input.RiskLevel.Value);
            }

            if (input.Status.HasValue)
            {
                query = query.Where(x => x.Status == input.Status.Value);
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

        private static string BuildRiskAssessment(UserRiskProfile profile)
        {
            if (profile.RiskScore == 0)
            {
                return "No suspicious activity detected for this actor.";
            }

            var reasons = new List<string>();

            if (profile.HighSeverityAlertCount > 0)
            {
                reasons.Add($"Multiple security alerts triggered recently ({profile.HighSeverityAlertCount} high/critical)");
            }

            if (profile.FailedLoginCount > 0)
            {
                reasons.Add($"Repeated failed login attempts ({profile.FailedLoginCount})");
            }

            if (profile.PrivilegedActionCount > 0)
            {
                reasons.Add($"Significant privileged operation activity ({profile.PrivilegedActionCount} operations)");
            }

            if (profile.OutOfHoursEventCount > 0)
            {
                reasons.Add($"Activity detected outside normal business hours ({profile.OutOfHoursEventCount} events)");
            }

            if (reasons.Count == 0)
            {
                return "Elevated alert volume detected. Review recent activity for patterns.";
            }

            var sb = new StringBuilder();
            sb.AppendLine($"This user exhibits {profile.RiskLevel.ToString().ToLower()} risk behavior based on:");
            foreach (var reason in reasons)
            {
                sb.AppendLine($"• {reason}");
            }

            return sb.ToString().TrimEnd();
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
                Status = profile.Status,
                AlertCount = profile.AlertCount,
                FailedLoginCount = profile.FailedLoginCount,
                PrivilegedActionCount = profile.PrivilegedActionCount,
                HighSeverityAlertCount = profile.HighSeverityAlertCount,
                OutOfHoursEventCount = profile.OutOfHoursEventCount,
                TotalEventCount = profile.TotalEventCount,
                LastActivityAt = profile.LastActivityAt,
                LastEvaluatedAt = profile.LastEvaluatedAt
            };
        }

        private static RecentActivityItemDto MapToRecentActivityItem(ActivityEvent e)
        {
            return new RecentActivityItemDto
            {
                Id = e.Id,
                EventTime = e.EventTime,
                Operation = e.Operation,
                ObjectName = e.ObjectName,
                Severity = e.Severity,
                IsSuccess = e.IsSuccess,
                DatabaseId = e.DatabaseId
            };
        }
    }
}
