using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Shouldly;
using Abp.Runtime.Session;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.UserRiskProfiles
{
    public class UserRiskProfile_Tests : Team2GroupProjectTestBase
    {
        private readonly IUserRiskProfileRepository _profileRepository;

        public UserRiskProfile_Tests()
        {
            _profileRepository = Resolve<IUserRiskProfileRepository>();
        }

        [Fact]
        public async Task Should_persist_user_risk_profile_with_default_state()
        {
            var tenantId = AbpSession.GetTenantId();

            var profile = new UserRiskProfile(tenantId, "db_user_01");

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(profile);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.UserRiskProfiles.SingleAsync(x => x.Id == profile.Id);

                persisted.TenantId.ShouldBe(tenantId);
                persisted.ActorUser.ShouldBe("db_user_01");
                persisted.RiskScore.ShouldBe(0);
                persisted.RiskLevel.ShouldBe(UserRiskLevel.None);
                persisted.AlertCount.ShouldBe(0);
                persisted.FailedLoginCount.ShouldBe(0);
                persisted.PrivilegedActionCount.ShouldBe(0);
                persisted.HighSeverityAlertCount.ShouldBe(0);
                persisted.OutOfHoursEventCount.ShouldBe(0);
            });
        }

        [Fact]
        public async Task RecalculateRisk_should_set_high_level_for_repeated_failures_and_alerts()
        {
            var tenantId = AbpSession.GetTenantId();
            var evaluatedAt = new DateTime(2026, 3, 17, 15, 0, 0);

            var profile = new UserRiskProfile(tenantId, "suspicious_actor")
            {
                ActorIp = "10.0.0.55",
                FailedLoginCount = 6,         // 6 * 5 = 30 pts
                HighSeverityAlertCount = 3,   // 3 * 10 = 30 pts
                PrivilegedActionCount = 2,    // 2 * 3 = 6 pts
                OutOfHoursEventCount = 4,     // 4 * 2 = 8 pts
                AlertCount = 5               // 5 * 1 = 5 pts → total = 79 → capped at 75 boundary = High
            };

            profile.RecalculateRisk(evaluatedAt);

            profile.RiskScore.ShouldBeGreaterThan(50);
            profile.RiskLevel.ShouldBeOneOf(UserRiskLevel.High, UserRiskLevel.Critical);
            profile.LastEvaluatedAt.ShouldBe(evaluatedAt);

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(profile);
            });

            await UsingDbContextAsync(async context =>
            {
                var persisted = await context.UserRiskProfiles.SingleAsync(x => x.Id == profile.Id);
                persisted.RiskScore.ShouldBeGreaterThan(50);
                persisted.RiskLevel.ShouldBeOneOf(UserRiskLevel.High, UserRiskLevel.Critical);
            });
        }

        [Fact]
        public async Task RecalculateRisk_should_set_none_for_clean_actor()
        {
            var profile = new UserRiskProfile(1, "clean_user");
            profile.RecalculateRisk(DateTime.UtcNow);

            profile.RiskScore.ShouldBe(0);
            profile.RiskLevel.ShouldBe(UserRiskLevel.None);
        }

        [Fact]
        public async Task RecalculateRisk_should_cap_score_at_100()
        {
            var profile = new UserRiskProfile(1, "very_risky_user")
            {
                FailedLoginCount = 100,
                HighSeverityAlertCount = 100,
                PrivilegedActionCount = 100,
                OutOfHoursEventCount = 100,
                AlertCount = 100
            };

            profile.RecalculateRisk(DateTime.UtcNow);

            profile.RiskScore.ShouldBe(100);
            profile.RiskLevel.ShouldBe(UserRiskLevel.Critical);
        }

        [Fact]
        public async Task GetTopRiskyAsync_should_return_actors_ordered_by_risk_score_descending()
        {
            var tenantId = AbpSession.GetTenantId();

            var highRisk = new UserRiskProfile(tenantId, "high_risk_actor") { FailedLoginCount = 6, HighSeverityAlertCount = 3 };
            highRisk.RecalculateRisk(DateTime.UtcNow);

            var medRisk = new UserRiskProfile(tenantId, "med_risk_actor") { FailedLoginCount = 2, AlertCount = 3 };
            medRisk.RecalculateRisk(DateTime.UtcNow);

            var noRisk = new UserRiskProfile(tenantId, "clean_actor");
            noRisk.RecalculateRisk(DateTime.UtcNow);

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(highRisk);
                await context.UserRiskProfiles.AddAsync(medRisk);
                await context.UserRiskProfiles.AddAsync(noRisk);
            });

            var top = await _profileRepository.GetTopRiskyAsync(tenantId, 2);

            top.Count.ShouldBe(2);
            top[0].RiskScore.ShouldBeGreaterThanOrEqualTo(top[1].RiskScore);
            top.ShouldNotContain(x => x.ActorUser == "clean_actor");
        }

        [Fact]
        public async Task FindByActorAsync_should_return_null_for_unknown_actor()
        {
            var tenantId = AbpSession.GetTenantId();

            var result = await _profileRepository.FindByActorAsync(tenantId, "ghost_user");

            result.ShouldBeNull();
        }

        [Fact]
        public async Task FindByActorAsync_should_return_profile_when_present()
        {
            var tenantId = AbpSession.GetTenantId();

            var profile = new UserRiskProfile(tenantId, "known_actor") { ActorIp = "192.168.1.10" };

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(profile);
            });

            var found = await _profileRepository.FindByActorAsync(tenantId, "known_actor");

            found.ShouldNotBeNull();
            found.ActorIp.ShouldBe("192.168.1.10");
        }

        [MultiTenantFact]
        public async Task Should_isolate_risk_profiles_by_tenant()
        {
            var profileTenantOne = new UserRiskProfile(1, "analyst") { FailedLoginCount = 5 };
            profileTenantOne.RecalculateRisk(DateTime.UtcNow);

            var profileTenantTwo = new UserRiskProfile(2, "analyst") { FailedLoginCount = 0 };
            profileTenantTwo.RecalculateRisk(DateTime.UtcNow);

            await UsingDbContextAsync(1, async context =>
            {
                await context.UserRiskProfiles.AddAsync(profileTenantOne);
            });

            await UsingDbContextAsync(2, async context =>
            {
                await context.UserRiskProfiles.AddAsync(profileTenantTwo);
            });

            // Tenant one's view of "analyst" should have the higher score
            await UsingDbContextAsync(async context =>
            {
                var t1Profile = await context.UserRiskProfiles
                    .SingleAsync(x => x.TenantId == 1 && x.ActorUser == "analyst");

                var t2Profile = await context.UserRiskProfiles
                    .SingleAsync(x => x.TenantId == 2 && x.ActorUser == "analyst");

                t1Profile.RiskScore.ShouldBeGreaterThan(t2Profile.RiskScore);
            });
        }

        [Fact]
        public async Task GetStaleProfilesAsync_should_return_profiles_older_than_threshold()
        {
            var tenantId = AbpSession.GetTenantId();
            var now = new DateTime(2026, 3, 17, 15, 0, 0);
            var threshold = now.AddHours(-1);

            var staleProfile = new UserRiskProfile(tenantId, "stale_user");
            staleProfile.RecalculateRisk(now.AddHours(-2)); // older than threshold

            var freshProfile = new UserRiskProfile(tenantId, "fresh_user");
            freshProfile.RecalculateRisk(now.AddMinutes(-10)); // newer than threshold

            await UsingDbContextAsync(async context =>
            {
                await context.UserRiskProfiles.AddAsync(staleProfile);
                await context.UserRiskProfiles.AddAsync(freshProfile);
            });

            var stale = await _profileRepository.GetStaleProfilesAsync(tenantId, threshold);

            stale.ShouldContain(x => x.ActorUser == "stale_user");
            stale.ShouldNotContain(x => x.ActorUser == "fresh_user");
        }
    }
}
