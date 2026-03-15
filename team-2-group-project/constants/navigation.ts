import {
  PERMISSIONS,
  canAccessRoles,
  canAccessTenants,
  canAccessUsers,
} from "@/utils/roles";

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

export const getVisibleNavigationItems = (permissions?: string[] | null) =>
  NAVIGATION_ITEMS.filter((item) => {
    if (!item.permission) {
      return true;
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

    return false;
  });
