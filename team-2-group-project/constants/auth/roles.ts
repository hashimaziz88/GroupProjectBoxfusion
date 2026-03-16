export const PERMISSIONS = {
  users: "Pages.Users",
  roles: "Pages.Roles",
  tenants: "Pages.Tenants",
  datasentinelDashboard: "Pages.DataSentinel.Dashboard",
  datasentinelIntake: "Pages.DataSentinel.Intake",
  datasentinelAnalytics: "Pages.DataSentinel.Analytics",
  datasentinelAlertsView: "Pages.DataSentinel.Alerts.View",
  datasentinelAlertsReview: "Pages.DataSentinel.Alerts.Review",
  datasentinelRulesView: "Pages.DataSentinel.Rules.View",
  datasentinelRulesManage: "Pages.DataSentinel.Rules.Manage",
  datasentinelAiInsights: "Pages.DataSentinel.AiInsights",
  datasentinelAdmin: "Pages.DataSentinel.Admin",
} as const;

export const STATIC_ROLES = {
  hostAdmin: "Admin",
  tenantAdmin: "Admin",
  securityAnalyst: "SecurityAnalyst",
  databaseAdministrator: "DBA",
  operationsManager: "OpsManager",
} as const;
