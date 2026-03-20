import {
  canAccessDataSentinelAlerts,
  canAccessDataSentinelActivity,
  canAccessDataSentinelDashboard,
  canAccessDataSentinelInfrastructure,
  canAccessDataSentinelIntake,
  canAccessDataSentinelReportsExport,
  canAccessRoles,
  canAccessTenants,
  canAccessUsers,
} from "@/utils/auth/roles";
import { PERMISSIONS } from "./auth/roles";

export interface INavigationItem {
  key: string;
  href?: string;
  label: string;
  permission?: string;
  children?: INavigationItem[];
}

export const NAVIGATION_ITEMS: INavigationItem[] = [
  {
    key: "home",
    href: "/home",
    label: "Home",
  },
  {
    key: "datasentinel-dashboard",
    href: "/datasentinel/dashboard",
    label: "Dashboard",
    permission: PERMISSIONS.dataSentinelDashboard,
  },
  {
    key: "datasentinel-infrastructure",
    label: "Infrastructure",
    permission: PERMISSIONS.dataSentinelInfrastructureView,
    children: [
      {
        key: "datasentinel-infrastructure-overview",
        href: "/datasentinel/infrastructure",
        label: "Overview",
        permission: PERMISSIONS.dataSentinelInfrastructureView,
      },
      {
        key: "datasentinel-infrastructure-servers",
        href: "/datasentinel/infrastructure/servers",
        label: "Servers",
        permission: PERMISSIONS.dataSentinelInfrastructureView,
      },
      {
        key: "datasentinel-infrastructure-databases",
        href: "/datasentinel/infrastructure/databases",
        label: "Databases",
        permission: PERMISSIONS.dataSentinelInfrastructureView,
      },
      {
        key: "datasentinel-infrastructure-tables",
        href: "/datasentinel/infrastructure/tables",
        label: "Tables",
        permission: PERMISSIONS.dataSentinelInfrastructureView,
      },
    ],
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
    key: "datasentinel-alerts",
    href: "/datasentinel/alerts",
    label: "Alerts",
    permission: PERMISSIONS.dataSentinelAlertsView,
  },
  {
    key: "datasentinel-reports",
    href: "/datasentinel/reports",
    label: "Reports",
    permission: PERMISSIONS.dataSentinelReportsExport,
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
  {
    key: "profile",
    href: "/profile",
    label: "Profile",
  },
];

const canAccessNavigationItem = (
  item: INavigationItem,
  permissions?: string[] | null,
  roles?: string[] | null,
  hasTenantContext = false,
) => {
  if (!item.permission) {
    return true;
  }

  const isDataSentinelItem =
    item.permission === PERMISSIONS.dataSentinelDashboard ||
    item.permission === PERMISSIONS.dataSentinelInfrastructureView ||
    item.permission === PERMISSIONS.dataSentinelIntake ||
    item.permission === PERMISSIONS.dataSentinelActivity ||
    item.permission === PERMISSIONS.dataSentinelAlertsView ||
    item.permission === PERMISSIONS.dataSentinelReportsExport;

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

  if (item.permission === PERMISSIONS.dataSentinelDashboard) {
    return canAccessDataSentinelDashboard(permissions);
  }

  if (item.permission === PERMISSIONS.dataSentinelInfrastructureView) {
    return canAccessDataSentinelInfrastructure(permissions);
  }

  if (item.permission === PERMISSIONS.dataSentinelIntake) {
    return canAccessDataSentinelIntake(permissions);
  }

  if (item.permission === PERMISSIONS.dataSentinelActivity) {
    return canAccessDataSentinelActivity(permissions, roles);
  }

  if (item.permission === PERMISSIONS.dataSentinelAlertsView) {
    return canAccessDataSentinelAlerts(permissions);
  }

  if (item.permission === PERMISSIONS.dataSentinelReportsExport) {
    return canAccessDataSentinelReportsExport(permissions, roles);
  }

  return false;
};

const filterNavigationItems = (
  items: INavigationItem[],
  permissions?: string[] | null,
  roles?: string[] | null,
  hasTenantContext = false,
): INavigationItem[] =>
  items.flatMap((item) => {
    if (!canAccessNavigationItem(item, permissions, roles, hasTenantContext)) {
      return [];
    }

    if (!item.children?.length) {
      return [item];
    }

    const visibleChildren = filterNavigationItems(
      item.children,
      permissions,
      roles,
      hasTenantContext,
    );

    return visibleChildren.length > 0
      ? [{ ...item, children: visibleChildren }]
      : [{ ...item, children: [] }];
  });

export const getVisibleNavigationItems = (
  permissions?: string[] | null,
  roles?: string[] | null,
  hasTenantContext = false,
) => filterNavigationItems(NAVIGATION_ITEMS, permissions, roles, hasTenantContext);
