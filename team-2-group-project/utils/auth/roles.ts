import { STATIC_ROLES } from "@/constants/auth/roles";
import { PERMISSIONS } from "@/constants/auth/roles";
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

export const isAdminOrManager = (roles?: string[] | null) =>
  isHostAdmin(roles) || isTenantAdmin(roles);

export const canAccessUsers = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.users);

export const canAccessRoles = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.roles);

export const canAccessTenants = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.tenants);

export const canAccessDataSentinelIntake = (permissions?: string[] | null) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelIntake);

export const canAccessDataSentinelInfrastructure = (
  permissions?: string[] | null,
) =>
  hasPermission(permissions, PERMISSIONS.dataSentinelInfrastructureView) ||
  hasPermission(permissions, PERMISSIONS.dataSentinelInfrastructureManage);

export const canAccessDataSentinelActivity = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelActivity);

export const canAccessDataSentinelAlerts = (
  permissions?: string[] | null,
) => hasPermission(permissions, PERMISSIONS.dataSentinelAlertsView);

export const selectBestAuthenticatedRoute = (
  user?: IRouteSelectorUser | null,
) => {
  if (canAccessUsers(user?.permissions)) {
    return "/users";
  }

  const hasTenantContext = Boolean(user?.tenantId);

  if (hasTenantContext && canAccessDataSentinelInfrastructure(user?.permissions)) {
    return "/datasentinel/infrastructure";
  }

  if (hasTenantContext && canAccessDataSentinelIntake(user?.permissions)) {
    return "/datasentinel/intake";
  }

  if (hasTenantContext && canAccessDataSentinelActivity(user?.permissions)) {
    return "/datasentinel/activity";
  }

  if (hasTenantContext && canAccessDataSentinelAlerts(user?.permissions)) {
    return "/datasentinel/alerts";
  }

  return "/home";
};
