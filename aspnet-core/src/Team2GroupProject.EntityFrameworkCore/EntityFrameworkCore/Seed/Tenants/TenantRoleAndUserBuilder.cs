using System.Collections.Generic;
using System.Linq;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.MultiTenancy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Team2GroupProject.Authorization;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;

namespace Team2GroupProject.EntityFrameworkCore.Seed.Tenants
{
    public class TenantRoleAndUserBuilder
    {
        private readonly Team2GroupProjectDbContext _context;
        private readonly int _tenantId;

        public TenantRoleAndUserBuilder(Team2GroupProjectDbContext context, int tenantId)
        {
            _context = context;
            _tenantId = tenantId;
        }

        public void Create()
        {
            CreateRolesAndUsers();
        }

        private void CreateRolesAndUsers()
        {
            var allTenantPermissions = PermissionFinder
                .GetAllPermissions(new Team2GroupProjectAuthorizationProvider())
                .Where(p => p.MultiTenancySides.HasFlag(MultiTenancySides.Tenant))
                .ToList();

            var adminRole = CreateStaticRole(StaticRoleNames.Tenants.Admin);
            GrantPermissions(adminRole, allTenantPermissions.Select(x => x.Name).ToArray());

            var analystRole = CreateStaticRole(StaticRoleNames.Tenants.SecurityAnalyst);
            GrantPermissions(analystRole, DataSentinelRolePermissionDefaults.SecurityAnalyst);

            var dbaRole = CreateStaticRole(StaticRoleNames.Tenants.DatabaseAdministrator);
            GrantPermissions(dbaRole, DataSentinelRolePermissionDefaults.DatabaseAdministrator);

            var opsManagerRole = CreateStaticRole(StaticRoleNames.Tenants.OperationsManager);
            GrantPermissions(opsManagerRole, DataSentinelRolePermissionDefaults.OperationsManager);

            CreateAdminUser(adminRole);
        }

        private Role CreateStaticRole(string roleName)
        {
            var role = _context.Roles.IgnoreQueryFilters()
                .FirstOrDefault(r => r.TenantId == _tenantId && r.Name == roleName);

            if (role != null)
            {
                return role;
            }

            role = _context.Roles.Add(new Role(_tenantId, roleName, roleName)
            {
                IsStatic = true
            }).Entity;

            _context.SaveChanges();

            return role;
        }

        private void GrantPermissions(Role role, IReadOnlyCollection<string> permissionNames)
        {
            var grantedPermissions = _context.Permissions.IgnoreQueryFilters()
                .OfType<RolePermissionSetting>()
                .Where(p => p.TenantId == _tenantId && p.RoleId == role.Id)
                .Select(p => p.Name)
                .ToList();

            var permissionsToAdd = permissionNames
                .Except(grantedPermissions)
                .Select(permissionName => new RolePermissionSetting
                {
                    TenantId = _tenantId,
                    Name = permissionName,
                    IsGranted = true,
                    RoleId = role.Id
                })
                .ToList();

            if (!permissionsToAdd.Any())
            {
                return;
            }

            _context.Permissions.AddRange(permissionsToAdd);
            _context.SaveChanges();
        }

        private void CreateAdminUser(Role adminRole)
        {
            var adminUser = _context.Users.IgnoreQueryFilters()
                .FirstOrDefault(u => u.TenantId == _tenantId && u.UserName == AbpUserBase.AdminUserName);

            if (adminUser == null)
            {
                adminUser = User.CreateTenantAdminUser(_tenantId, "admin@defaulttenant.com");
                adminUser.Password = new PasswordHasher<User>(new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())).HashPassword(adminUser, "123qwe");
                adminUser.IsEmailConfirmed = true;
                adminUser.IsActive = true;

                _context.Users.Add(adminUser);
                _context.SaveChanges();
            }

            var hasAdminRole = _context.UserRoles.IgnoreQueryFilters()
                .Any(x => x.TenantId == _tenantId && x.UserId == adminUser.Id && x.RoleId == adminRole.Id);

            if (hasAdminRole)
            {
                return;
            }

            _context.UserRoles.Add(new UserRole(_tenantId, adminUser.Id, adminRole.Id));
            _context.SaveChanges();
        }
    }
}
