namespace Team2GroupProject.Authorization.Roles
{
    public static class DataSentinelRolePermissionDefaults
    {
        public static readonly string[] SecurityAnalyst =
        {
            PermissionNames.Pages_DataSentinel,
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Alerts_View,
            PermissionNames.Pages_DataSentinel_Alerts_Review,
            PermissionNames.Pages_DataSentinel_Rules_View,
            PermissionNames.Pages_DataSentinel_AiInsights
        };

        public static readonly string[] DatabaseAdministrator =
        {
            PermissionNames.Pages_DataSentinel,
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Intake,
            PermissionNames.Pages_DataSentinel_Alerts_View,
            PermissionNames.Pages_DataSentinel_Rules_View
        };

        public static readonly string[] OperationsManager =
        {
            PermissionNames.Pages_DataSentinel,
            PermissionNames.Pages_DataSentinel_Dashboard,
            PermissionNames.Pages_DataSentinel_Analytics,
            PermissionNames.Pages_DataSentinel_Alerts_View
        };
    }
}
