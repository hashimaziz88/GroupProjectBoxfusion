export const PERMISSIONS = {
  users: "Pages.Users",
  usersActivation: "Pages.Users.Activation",
  roles: "Pages.Roles",
  tenants: "Pages.Tenants",
  dataSentinelDashboard: "Pages.DataSentinel.Dashboard",
  dataSentinelIntake: "Pages.DataSentinel.Intake",
  dataSentinelInfrastructureView: "Pages.DataSentinel.Infrastructure.View",
  dataSentinelInfrastructureManage: "Pages.DataSentinel.Infrastructure.Manage",
  dataSentinelActivity: "Pages.DataSentinel.ActivityEvents.View",
  dataSentinelAlertsView: "Pages.DataSentinel.Alerts.View",
  dataSentinelAlertsReview: "Pages.DataSentinel.Alerts.Review",
  dataSentinelAlertsManage: "Pages.DataSentinel.Alerts.Manage",
  dataSentinelRulesView: "Pages.DataSentinel.Rules.View",
  dataSentinelRulesManage: "Pages.DataSentinel.Rules.Manage",
  dataSentinelReportsExport: "Pages.DataSentinel.Reports.Export",
  dataSentinelAdmin: "Pages.DataSentinel.Admin",
  dataSentinelAiInsights: "Pages.DataSentinel.AiInsights",
} as const;

export const STATIC_ROLES = {
  hostAdmin: "Host.Admin",
  tenantAdmin: "Tenants.Admin",
} as const;
