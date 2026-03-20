import { PERMISSIONS } from "@/constants/auth/roles";
import { DATA_SENTINEL_ROLE_ALIASES, STATIC_ROLES } from "@/constants/auth/roles";
import { IRouteSelectorUser } from "@/interfaces/auth/roles";

const normalizeValues = (values?: string[] | null) =>
  Array.isArray(values)
    ? values.map((value) => value.trim().toLowerCase())
    : [];

export const hasRole = (roles: string[] | null | undefined, roleName: string) =>
  normalizeValues(roles).includes(roleName.toLowerCase());

export const hasPermission = (
  permissions: string[] | null | undefined,
  permissionName: string,
) => normalizeValues(permissions).includes(permissionName.toLowerCase());

export const isHostAdmin = (roles?: string[] | null) =>
  hasRole(roles, STATIC_ROLES.hostAdmin);

export const isTenantAdmin = (roles?: string[] | null) =>
  hasRole(roles, STATIC_ROLES.tenantAdmin);

export const isSecurityAnalyst = (roles?: string[] | null) =>
  DATA_SENTINEL_ROLE_ALIASES.securityAnalyst.some((roleName) =>
    hasRole(roles, roleName),
  );

export const isAdminOrManager = (roles?: string[] | null) =>
  isHostAdmin(roles) || isTenantAdmin(roles);

export const canAccessUsers = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.users);

export const canActivateUsers = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.usersActivation);

export const canAccessRoles = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.roles);

export const canAccessTenants = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.tenants);

export const canAccessDataSentinelIntake = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelIntake);

export const canAccessDataSentinelDashboard = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelDashboard);

export const canAccessDataSentinelInfrastructure = (
  permissions?: string[] | null,
) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelInfrastructureView) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelInfrastructureManage);

export const canAccessDataSentinelActivity = (
  permissions?: string[] | null,
  roles?: string[] | null,
) =>
  !isSecurityAnalyst(roles) &&
  hasPermission(permissions, PERMISSIONS.dataSentinelActivity);

export const canAccessDataSentinelAlerts = (
  permissions?: string[] | null,
) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelAlertsView) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelAlertsReview) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelAlertsManage);

export const canReviewDataSentinelAlerts = (
  permissions?: string[] | null,
) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelAlertsReview) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelAlertsManage);

export const canManageDataSentinelAlerts = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelAlertsManage);

export const canAccessDataSentinelRules = (
  permissions?: string[] | null,
) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelRulesView) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelRulesManage);

export const canManageDataSentinelRules = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelRulesManage);

export const canAccessDataSentinelReportsExport = (
  permissions?: string[] | null,
  roles?: string[] | null,
) =>
  !isSecurityAnalyst(roles) &&
  hasPermission(permissions, PERMISSIONS.dataSentinelReportsExport);

export const canAccessDataSentinelAdmin = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelAdmin);

export const canAccessDataSentinelAiInsights = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelAiInsights);

export const canManageUsersCrud = (
  _roles?: string[] | null,
  permissions?: string[] | null,
) => canAccessUsers(permissions);

export const canManageRolesCrud = (
  _roles?: string[] | null,
  permissions?: string[] | null,
) => canAccessRoles(permissions);

export const canManageTenantsCrud = (
  _roles?: string[] | null,
  permissions?: string[] | null,
) => canAccessTenants(permissions);

export const selectBestAuthenticatedRoute = (
  user?: IRouteSelectorUser | null,
) => {
  const hasTenantContext = Boolean(user?.tenantId);

  if (hasTenantContext && canAccessDataSentinelDashboard(user?.permissions)) {
    return "/datasentinel/dashboard";
  }

  if (hasTenantContext && canAccessDataSentinelInfrastructure(user?.permissions)) {
    return "/datasentinel/infrastructure";
  }

  if (hasTenantContext && canAccessDataSentinelIntake(user?.permissions)) {
    return "/datasentinel/intake";
  }

  if (hasTenantContext && canAccessDataSentinelActivity(user?.permissions, user?.roles)) {
    return "/datasentinel/activity";
  }

  if (hasTenantContext && canAccessDataSentinelAlerts(user?.permissions)) {
    return "/datasentinel/alerts";
  }

  if (
    hasTenantContext &&
    canAccessDataSentinelReportsExport(user?.permissions, user?.roles)
  ) {
    return "/datasentinel/reports";
  }

  if (canAccessUsers(user?.permissions)) {
    return "/users";
  }

  return "/profile";
};
