using System;
using System.Threading.Tasks;
using Abp.UI;
using Shouldly;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Team2GroupProject.DataSentinel.UserRiskProfiles.Dto;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.UserRiskProfiles
{
    public class UserRiskProfileAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IUserRiskProfileAppService _appService;

        public UserRiskProfileAppService_Tests()
        {
            _appService = Resolve<IUserRiskProfileAppService>();
        }

        [Fact]
        public async Task GetPagedAsync_should_return_profiles_ordered_by_risk_score_descending()
        {
            var tenantId = AbpSession.TenantId!.Value;

            await SeedProfileAsync(tenantId, "low_user", riskScore: 20, riskLevel: UserRiskLevel.Low);
            await SeedProfileAsync(tenantId, "critical_user", riskScore: 90, riskLevel: UserRiskLevel.Critical);
            await SeedProfileAsync(tenantId, "high_user", riskScore: 70, riskLevel: UserRiskLevel.High);

            var result = await _appService.GetPagedAsync(new GetUserRiskProfilesInput());

            result.TotalCount.ShouldBeGreaterThanOrEqualTo(3);
            result.Items[0].RiskScore.ShouldBeGreaterThanOrEqualTo(result.Items[1].RiskScore);
        }

        [Fact]
        public async Task GetPagedAsync_should_filter_by_keyword()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedProfileAsync(tenantId, "john_doe");
            await SeedProfileAsync(tenantId, "jane_smith");

            var result = await _appService.GetPagedAsync(new GetUserRiskProfilesInput { Keyword = "john" });

            result.Items.ShouldAllBe(x => x.ActorUser.Contains("john"));
        }

        [Fact]
        public async Task GetPagedAsync_should_filter_by_risk_level()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedProfileAsync(tenantId, "critical_actor", riskScore: 90, riskLevel: UserRiskLevel.Critical);
            await SeedProfileAsync(tenantId, "low_actor", riskScore: 10, riskLevel: UserRiskLevel.Low);

            var result = await _appService.GetPagedAsync(new GetUserRiskProfilesInput
            {
                RiskLevel = UserRiskLevel.Critical
            });

            result.Items.ShouldAllBe(x => x.RiskLevel == UserRiskLevel.Critical);
        }

        [Fact]
        public async Task GetPagedAsync_should_filter_by_min_risk_score()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedProfileAsync(tenantId, "score_80", riskScore: 80);
            await SeedProfileAsync(tenantId, "score_20", riskScore: 20);

            var result = await _appService.GetPagedAsync(new GetUserRiskProfilesInput { MinRiskScore = 50 });

            result.Items.ShouldAllBe(x => x.RiskScore >= 50);
        }

        [Fact]
        public async Task GetPagedAsync_should_filter_by_max_risk_score()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedProfileAsync(tenantId, "score_90_max", riskScore: 90);
            await SeedProfileAsync(tenantId, "score_10_max", riskScore: 10);

            var result = await _appService.GetPagedAsync(new GetUserRiskProfilesInput { MaxRiskScore = 50 });

            result.Items.ShouldAllBe(x => x.RiskScore <= 50);
        }

        [Fact]
        public async Task GetByIdAsync_should_return_correct_profile()
        {
            var tenantId = AbpSession.TenantId!.Value;
            var profile = await SeedProfileAsync(tenantId, "lookup_user", riskScore: 55, riskLevel: UserRiskLevel.High);

            var result = await _appService.GetByIdAsync(profile.Id);

            result.ActorUser.ShouldBe("lookup_user");
            result.RiskScore.ShouldBe(55);
            result.RiskLevel.ShouldBe(UserRiskLevel.High);
        }

        [Fact]
        public async Task GetByIdAsync_should_throw_for_unknown_id()
        {
            await Should.ThrowAsync<UserFriendlyException>(() =>
                _appService.GetByIdAsync(Guid.NewGuid()));
        }

        [Fact]
        public async Task GetSummaryAsync_should_return_correct_counts()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedProfileAsync(tenantId, "summary_critical", riskScore: 90, riskLevel: UserRiskLevel.Critical, alertCount: 5);
            await SeedProfileAsync(tenantId, "summary_high", riskScore: 70, riskLevel: UserRiskLevel.High, alertCount: 3);
            await SeedProfileAsync(tenantId, "summary_low", riskScore: 10, riskLevel: UserRiskLevel.Low, alertCount: 1);

            var summary = await _appService.GetSummaryAsync();

            summary.TotalUsers.ShouldBeGreaterThanOrEqualTo(3);
            summary.HighRiskUsers.ShouldBeGreaterThanOrEqualTo(2);
            summary.TotalAlerts.ShouldBeGreaterThanOrEqualTo(9);
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

        private async Task<UserRiskProfile> SeedProfileAsync(
            int tenantId,
            string actorUser,
            int riskScore = 0,
            UserRiskLevel riskLevel = UserRiskLevel.None,
            int alertCount = 0)
        {
            var profile = new UserRiskProfile(tenantId, actorUser)
            {
                RiskScore = riskScore,
                RiskLevel = riskLevel,
                AlertCount = alertCount
            };

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(profile);
            });

            return profile;
        }
    }
}
