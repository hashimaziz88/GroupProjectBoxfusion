import {
  hasPermission,
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
    key: "home",
    href: "/home",
    label: "Dashboard",
    permission: PERMISSIONS.datasentinelDashboard,
  },
  {
    key: "alerts",
    href: "/datasentinel/alerts",
    label: "Security Alerts",
    permission: PERMISSIONS.datasentinelAlertsView,
  },
  {
    key: "activity",
    href: "/datasentinel/activity",
    label: "Activity Events",
    permission: PERMISSIONS.datasentinelDashboard,
  },
  {
    key: "analytics",
    href: "/datasentinel/analytics",
    label: "Analytics",
    permission: PERMISSIONS.datasentinelAnalytics,
  },
  {
    key: "rules",
    href: "/datasentinel/rules",
    label: "Alert Rules",
    permission: PERMISSIONS.datasentinelRulesView,
  },
  {
    key: "intake",
    href: "/datasentinel/intake",
    label: "Demo Intake",
    permission: PERMISSIONS.datasentinelIntake,
  },
  {
    key: "assets",
    href: "/datasentinel/assets",
    label: "Servers & Databases",
    permission: PERMISSIONS.datasentinelDashboard,
  },
  {
    key: "about",
    href: "/about",
    label: "Platform",
  },
  {
    key: "roles",
    href: "/roles",
    label: "Access Control",
    permission: PERMISSIONS.roles,
  },
  {
    key: "tenants",
    href: "/tenants",
    label: "Environments",
    permission: PERMISSIONS.tenants,
  },
  {
    key: "users",
    href: "/users",
    label: "Identities",
    permission: PERMISSIONS.users,
  },
];

export const getVisibleNavigationItems = (permissions?: string[] | null) =>
  NAVIGATION_ITEMS.filter((item) => {
    if (!item.permission) {
      return true;
    }

    return hasPermission(permissions, item.permission);
  });
