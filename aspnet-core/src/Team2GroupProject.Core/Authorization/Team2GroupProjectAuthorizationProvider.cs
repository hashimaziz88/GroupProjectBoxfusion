using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace Team2GroupProject.Authorization
{
    public class Team2GroupProjectAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
            context.CreatePermission(PermissionNames.Pages_Users_Activation, L("UsersActivation"));
            context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
            context.CreatePermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);

            // DataSentinel permission hierarchy
            var dataSentinel = context.CreatePermission(PermissionNames.Pages_DataSentinel, L("DataSentinel"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Dashboard, L("DataSentinelDashboard"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Intake, L("DataSentinelIntake"));
            var monitoringInfrastructure = dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Infrastructure_View, L("DataSentinelInfrastructureView"));
            monitoringInfrastructure.CreateChildPermission(PermissionNames.Pages_DataSentinel_Infrastructure_Manage, L("DataSentinelInfrastructureManage"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_ActivityEvents_View, L("DataSentinelActivityEventsView"));

            var alerts = dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Alerts_View, L("DataSentinelAlertsView"));
            alerts.CreateChildPermission(PermissionNames.Pages_DataSentinel_Alerts_Review, L("DataSentinelAlertsReview"));
            alerts.CreateChildPermission(PermissionNames.Pages_DataSentinel_Alerts_Manage, L("DataSentinelAlertsManage"));

            var rules = dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Rules_View, L("DataSentinelRulesView"));
            rules.CreateChildPermission(PermissionNames.Pages_DataSentinel_Rules_Manage, L("DataSentinelRulesManage"));

            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Users_View, L("DataSentinelUsersView"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Reports_Export, L("DataSentinelReportsExport"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_Admin, L("DataSentinelAdmin"));
            dataSentinel.CreateChildPermission(PermissionNames.Pages_DataSentinel_AiInsights, L("DataSentinelAiInsights"));
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, Team2GroupProjectConsts.LocalizationSourceName);
        }
    }
}
