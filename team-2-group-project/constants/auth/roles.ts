export const PERMISSIONS = {
  users: "Pages.Users",
  roles: "Pages.Roles",
  tenants: "Pages.Tenants",
  dataSentinelIntake: "Pages.DataSentinel.Intake",
  dataSentinelInfrastructureView: "Pages.DataSentinel.Infrastructure.View",
  dataSentinelInfrastructureManage: "Pages.DataSentinel.Infrastructure.Manage",
  dataSentinelActivity: "Pages.DataSentinel.ActivityEvents.View",
} as const;

export const STATIC_ROLES = {
  hostAdmin: "Host.Admin",
  tenantAdmin: "Tenants.Admin",
} as const;
