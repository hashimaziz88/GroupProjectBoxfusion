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

export const selectBestAuthenticatedRoute = (
  user?: IRouteSelectorUser | null,
) => {
  if (canAccessUsers(user?.permissions)) {
    return "/users";
  }

  return "/home";
};
