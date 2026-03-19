export const PERMISSIONS = {
  users: "Pages.Users",
  roles: "Pages.Roles",
  tenants: "Pages.Tenants",
  dataSentinelIntake: "Pages.DataSentinel.Intake",
  dataSentinelInfrastructureView: "Pages.DataSentinel.Infrastructure.View",
  dataSentinelInfrastructureManage: "Pages.DataSentinel.Infrastructure.Manage",
  dataSentinelActivity: "Pages.DataSentinel.ActivityEvents.View",
  dataSentinelAlertsView: "Pages.DataSentinel.Alerts.View",
  dataSentinelAlertsReview: "Pages.DataSentinel.Alerts.Review",
  dataSentinelAlertsManage: "Pages.DataSentinel.Alerts.Manage",
  dataSentinelReportsExport: "Pages.DataSentinel.Reports.Export",
} as const;

export const STATIC_ROLES = {
  hostAdmin: "Host.Admin",
  tenantAdmin: "Tenants.Admin",
} as const;
