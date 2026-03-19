using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.MultiTenancy;
using Abp.UI;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;

namespace Team2GroupProject.Authorization.Roles
{
    /// <summary>
    /// Seeds DataSentinel persona roles for a tenant using deterministic permission bundles.
    /// </summary>
    public class DataSentinelRoleSeeder : IDataSentinelRoleSeeder, ITransientDependency
    {
        private const string TenantAdminRoleDescription = "Tenant administrator role. This role is the Platform Administrator equivalent for DataSentinel.";

        private static readonly IReadOnlyList<string> SecurityAnalystPermissionNames = new[]
        {
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Infrastructure_View,
            PermissionNames.Pages_DataSentinel_ActivityEvents_View,
            PermissionNames.Pages_DataSentinel_Alerts_View,
            PermissionNames.Pages_DataSentinel_Alerts_Review,
            PermissionNames.Pages_DataSentinel_Reports_Export,
            PermissionNames.Pages_DataSentinel_AiInsights
        };

        private static readonly IReadOnlyList<string> DbaPermissionNames = new[]
        {
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Intake,
            PermissionNames.Pages_DataSentinel_Infrastructure_View,
            PermissionNames.Pages_DataSentinel_Infrastructure_Manage,
            PermissionNames.Pages_DataSentinel_ActivityEvents_View,
            PermissionNames.Pages_DataSentinel_Alerts_View,
            PermissionNames.Pages_DataSentinel_Alerts_Review,
            PermissionNames.Pages_DataSentinel_Rules_View,
            PermissionNames.Pages_DataSentinel_Rules_Manage
        };

        private static readonly IReadOnlyList<string> OperationsManagerPermissionNames = new[]
        {
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Alerts_View,
            PermissionNames.Pages_DataSentinel_Reports_Export
        };

        private readonly RoleManager _roleManager;
        private readonly IPermissionManager _permissionManager;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="DataSentinelRoleSeeder"/> class.
        /// </summary>
        public DataSentinelRoleSeeder(RoleManager roleManager, IPermissionManager permissionManager, IUnitOfWorkManager unitOfWorkManager)
        {
            _roleManager = roleManager;
            _permissionManager = permissionManager;
            _unitOfWorkManager = unitOfWorkManager;
        }

        /// <summary>
        /// Creates or updates DataSentinel persona roles and grants their permission bundles.
        /// </summary>
        /// <param name="tenantId">Tenant identifier.</param>
        public async Task SeedAsync(int tenantId)
        {
            if (tenantId <= 0)
            {
                throw new UserFriendlyException("TenantId must be a positive value.");
            }

            using var uow = _unitOfWorkManager.Begin();
            _unitOfWorkManager.Current.SetTenantId(tenantId);

            var permissionLookup = _permissionManager.GetAllPermissions()
                .Where(x => x.MultiTenancySides.HasFlag(MultiTenancySides.Tenant))
                .ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);

            await EnsureRoleAsync(
                tenantId,
                DataSentinelRoleNames.SecurityAnalyst,
                "DataSentinel Security Analyst",
                "Security Analyst � monitors alerts, activity events, and exports reports.",
                SecurityAnalystPermissionNames,
                permissionLookup);

            await EnsureRoleAsync(
                tenantId,
                DataSentinelRoleNames.Dba,
                "DataSentinel DBA",
                "DBA � manages infrastructure, intake, and rules.",
                DbaPermissionNames,
                permissionLookup);

            await EnsureRoleAsync(
                tenantId,
                DataSentinelRoleNames.OperationsManager,
                "DataSentinel Operations Manager",
                "Operations Manager � monitors dashboards and alerts, and exports summaries.",
                OperationsManagerPermissionNames,
                permissionLookup);

            await EnsureTenantAdminDescriptionAsync(tenantId);

            await uow.CompleteAsync();
        }

        private async Task EnsureRoleAsync(
            int tenantId,
            string roleName,
            string displayName,
            string description,
            IReadOnlyCollection<string> permissionNames,
            IReadOnlyDictionary<string, Permission> permissionLookup)
        {
            var role = await _roleManager.Roles
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Name == roleName);

            var isNewRole = role == null;
            if (isNewRole)
            {
                role = new Role(tenantId, roleName, displayName)
                {
                    Description = description,
                    IsStatic = false,
                    IsDefault = false
                };

                EnsureSucceeded(await _roleManager.CreateAsync(role), $"Unable to create role '{roleName}'");
            }
            else
            {
                var shouldUpdate = false;

                if (!string.Equals(role.DisplayName, displayName, StringComparison.Ordinal))
                {
                    role.DisplayName = displayName;
                    shouldUpdate = true;
                }

                if (!string.Equals(role.Description, description, StringComparison.Ordinal))
                {
                    role.Description = description;
                    shouldUpdate = true;
                }

                if (shouldUpdate)
                {
                    EnsureSucceeded(await _roleManager.UpdateAsync(role), $"Unable to update role '{roleName}'");
                }
            }

            var permissions = permissionNames
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Select(permissionName => ResolveTenantPermission(permissionName, permissionLookup))
                .ToList();

            await _roleManager.SetGrantedPermissionsAsync(role, permissions);
        }

        private async Task EnsureTenantAdminDescriptionAsync(int tenantId)
        {
            var tenantAdminRole = await _roleManager.Roles
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Name == StaticRoleNames.Tenants.Admin);

            if (tenantAdminRole == null ||
                string.Equals(tenantAdminRole.Description, TenantAdminRoleDescription, StringComparison.Ordinal))
            {
                return;
            }

            tenantAdminRole.Description = TenantAdminRoleDescription;
            EnsureSucceeded(await _roleManager.UpdateAsync(tenantAdminRole), "Unable to update tenant admin role description");
        }

        private static Permission ResolveTenantPermission(
            string permissionName,
            IReadOnlyDictionary<string, Permission> permissionLookup)
        {
            if (permissionLookup.TryGetValue(permissionName, out var permission))
            {
                return permission;
            }

            throw new UserFriendlyException($"Permission '{permissionName}' is not registered for tenant scope.");
        }

        private static void EnsureSucceeded(IdentityResult identityResult, string message)
        {
            if (identityResult.Succeeded)
            {
                return;
            }

            var errors = identityResult.Errors?.Select(x => x.Description).Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
            if (errors == null || errors.Count == 0)
            {
                throw new UserFriendlyException(message);
            }

            throw new UserFriendlyException($"{message}. {string.Join("; ", errors)}");
        }
    }
}
