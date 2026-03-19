using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization.Roles;
using Abp.Domain.Uow;
using Shouldly;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Roles;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.Authorization
{
    public class DataSentinelRoleSeeder_Tests : Team2GroupProjectTestBase
    {
        [Fact]
        public async Task SeedAsync_should_create_persona_roles_for_default_tenant()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedForTenantAsync(tenantId);

            var roles = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.Roles
                    .Where(x => x.TenantId == tenantId)
                    .Where(x => x.Name == DataSentinelRoleNames.SecurityAnalyst ||
                                x.Name == DataSentinelRoleNames.Dba ||
                                x.Name == DataSentinelRoleNames.OperationsManager)
                    .Select(x => x.Name)
                    .ToList()));

            roles.ShouldContain(DataSentinelRoleNames.SecurityAnalyst);
            roles.ShouldContain(DataSentinelRoleNames.Dba);
            roles.ShouldContain(DataSentinelRoleNames.OperationsManager);
        }

        [Fact]
        public async Task SeedAsync_should_be_idempotent_for_roles_and_permissions()
        {
            var tenantId = AbpSession.TenantId!.Value;

            await SeedForTenantAsync(tenantId);
            await SeedForTenantAsync(tenantId);

            var seededState = await UsingDbContextAsync(async context =>
            {
                var roles = context.Roles
                    .Where(x => x.TenantId == tenantId)
                    .Where(x => x.Name == DataSentinelRoleNames.SecurityAnalyst ||
                                x.Name == DataSentinelRoleNames.Dba ||
                                x.Name == DataSentinelRoleNames.OperationsManager)
                    .ToList();

                var roleIds = roles.Select(x => x.Id).ToList();
                var grantedPermissionNames = context.Permissions
                    .OfType<RolePermissionSetting>()
                    .Where(x => x.TenantId == tenantId && x.IsGranted && roleIds.Contains(x.RoleId))
                    .Select(x => x.Name)
                    .ToList();

                return await Task.FromResult(new
                {
                    RoleCount = roles.Count,
                    RoleNames = roles.Select(x => x.Name).OrderBy(x => x).ToList(),
                    PermissionNames = grantedPermissionNames
                });
            });

            seededState.RoleCount.ShouldBe(3);
            seededState.RoleNames.ShouldBe(new[]
            {
                DataSentinelRoleNames.Dba,
                DataSentinelRoleNames.OperationsManager,
                DataSentinelRoleNames.SecurityAnalyst
            });

            var requiredPermissions = new[]
            {
                PermissionNames.Pages_DataSentinel_Dashboard,
                PermissionNames.Pages_DataSentinel_Infrastructure_View,
                PermissionNames.Pages_DataSentinel_ActivityEvents_View,
                PermissionNames.Pages_DataSentinel_Alerts_View,
                PermissionNames.Pages_DataSentinel_Alerts_Review,
                PermissionNames.Pages_DataSentinel_Reports_Export,
                PermissionNames.Pages_DataSentinel_AiInsights,
                PermissionNames.Pages_DataSentinel_Intake,
                PermissionNames.Pages_DataSentinel_Infrastructure_Manage,
                PermissionNames.Pages_DataSentinel_Rules_View,
                PermissionNames.Pages_DataSentinel_Rules_Manage
            };

            foreach (var permissionName in requiredPermissions)
            {
                seededState.PermissionNames.ShouldContain(permissionName);
            }
        }

        [Fact]
        public async Task SeedAsync_should_mark_tenant_admin_as_platform_administrator_equivalent()
        {
            var tenantId = AbpSession.TenantId!.Value;
            await SeedForTenantAsync(tenantId);

            var tenantAdminDescription = await UsingDbContextAsync(async context =>
                await Task.FromResult(context.Roles
                    .Where(x => x.TenantId == tenantId && x.Name == StaticRoleNames.Tenants.Admin)
                    .Select(x => x.Description)
                    .FirstOrDefault()));

            tenantAdminDescription.ShouldNotBeNullOrWhiteSpace();
            tenantAdminDescription.ShouldContain("Platform Administrator equivalent");
        }

        private async Task SeedForTenantAsync(int tenantId)
        {
            using (UsingTenantId(tenantId))
            {
                var unitOfWorkManager = Resolve<IUnitOfWorkManager>();
                using (var unitOfWork = unitOfWorkManager.Begin())
                {
                    var seeder = Resolve<IDataSentinelRoleSeeder>();
                    await seeder.SeedAsync(tenantId);
                    await unitOfWork.CompleteAsync();
                }
            }
        }
    }
}
