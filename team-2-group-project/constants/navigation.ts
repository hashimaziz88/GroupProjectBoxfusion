import {
  canAccessDataSentinelInfrastructure,
  canAccessDataSentinelIntake,
  canAccessDataSentinelActivity,
  canAccessRoles,
  canAccessTenants,
  canAccessUsers,
} from "@/utils/auth/roles";
import { PERMISSIONS } from "./auth/roles";

export interface INavigationItem {
  key: string;
  href: string;
  label: string;
  permission?: string;
}

export const NAVIGATION_ITEMS: INavigationItem[] = [
  {
    key: "about",
    href: "/about",
    label: "About",
  },
  {
    key: "home",
    href: "/home",
    label: "Home",
  },
  {
    key: "datasentinel-infrastructure",
    href: "/datasentinel/infrastructure",
    label: "Infrastructure",
    permission: PERMISSIONS.dataSentinelInfrastructureView,
  },
  {
    key: "datasentinel-intake",
    href: "/datasentinel/intake",
    label: "Intake",
    permission: PERMISSIONS.dataSentinelIntake,
  },
  {
    key: "datasentinel-activity",
    href: "/datasentinel/activity",
    label: "Activity",
    permission: PERMISSIONS.dataSentinelActivity,
  },
  {
    key: "roles",
    href: "/roles",
    label: "Roles",
    permission: PERMISSIONS.roles,
  },
  {
    key: "tenants",
    href: "/tenants",
    label: "Tenants",
    permission: PERMISSIONS.tenants,
  },
  {
    key: "users",
    href: "/users",
    label: "Users",
    permission: PERMISSIONS.users,
  },
];

export const getVisibleNavigationItems = (
  permissions?: string[] | null,
  hasTenantContext = false,
) =>
  NAVIGATION_ITEMS.filter((item) => {
    if (!item.permission) {
      return true;
    }

    const isDataSentinelItem =
      item.permission === PERMISSIONS.dataSentinelInfrastructureView ||
      item.permission === PERMISSIONS.dataSentinelIntake ||
      item.permission === PERMISSIONS.dataSentinelActivity;

    if (isDataSentinelItem && !hasTenantContext) {
      return false;
    }

    if (item.permission === PERMISSIONS.users) {
      return canAccessUsers(permissions);
    }

    if (item.permission === PERMISSIONS.roles) {
      return canAccessRoles(permissions);
    }

    if (item.permission === PERMISSIONS.tenants) {
      return canAccessTenants(permissions);
    }

    if (item.permission === PERMISSIONS.dataSentinelInfrastructureView) {
      return canAccessDataSentinelInfrastructure(permissions);
    }

    if (item.permission === PERMISSIONS.dataSentinelIntake) {
      return canAccessDataSentinelIntake(permissions);
    }

    if (item.permission === PERMISSIONS.dataSentinelActivity) {
      return canAccessDataSentinelActivity(permissions);
    }

    return false;
  });
