using System.Linq;
using Abp.Authorization.Roles;
using Shouldly;
using Xunit;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Roles;

namespace Team2GroupProject.Tests.DataSentinel
{
    public class DataSentinelRoleSeed_Tests : Team2GroupProjectTestBase
    {
        [Fact]
        public void Should_seed_datasentinel_roles_for_default_tenant()
        {
            UsingDbContext(context =>
            {
                context.Roles.Count(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.SecurityAnalyst).ShouldBe(1);
                context.Roles.Count(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.DatabaseAdministrator).ShouldBe(1);
                context.Roles.Count(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.OperationsManager).ShouldBe(1);
            });
        }

        [Fact]
        public void Should_grant_expected_permissions_to_security_roles()
        {
            UsingDbContext(context =>
            {
                var analystRoleId = context.Roles.Single(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.SecurityAnalyst).Id;
                var analystPermissions = context.Permissions
                    .OfType<RolePermissionSetting>()
                    .Where(x => x.TenantId == 1 && x.RoleId == analystRoleId && x.IsGranted)
                    .Select(x => x.Name)
                    .ToList();

                analystPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Dashboard);
                analystPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Alerts_View);
                analystPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Alerts_Review);
                analystPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_AiInsights);

                var dbaRoleId = context.Roles.Single(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.DatabaseAdministrator).Id;
                var dbaPermissions = context.Permissions
                    .OfType<RolePermissionSetting>()
                    .Where(x => x.TenantId == 1 && x.RoleId == dbaRoleId && x.IsGranted)
                    .Select(x => x.Name)
                    .ToList();

                dbaPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Intake);
                dbaPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Alerts_View);
                dbaPermissions.ShouldNotContain(PermissionNames.Pages_DataSentinel_Alerts_Review);

                var opsRoleId = context.Roles.Single(x => x.TenantId == 1 && x.Name == StaticRoleNames.Tenants.OperationsManager).Id;
                var opsPermissions = context.Permissions
                    .OfType<RolePermissionSetting>()
                    .Where(x => x.TenantId == 1 && x.RoleId == opsRoleId && x.IsGranted)
                    .Select(x => x.Name)
                    .ToList();

                opsPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Analytics);
                opsPermissions.ShouldContain(PermissionNames.Pages_DataSentinel_Alerts_View);
                opsPermissions.ShouldNotContain(PermissionNames.Pages_DataSentinel_Alerts_Review);
            });
        }
    }
}
