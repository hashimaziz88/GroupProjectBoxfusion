"use client";

import { Alert } from "antd";
import AppShell from "@/components/auth/AppShell";
import ActivityAiPanel from "@/components/datasentinel/activity/ActivityAiPanel";
import ActivityEventsTable from "@/components/datasentinel/activity/ActivityEventsTable";
import ActivityFilterPanel from "@/components/datasentinel/activity/ActivityFilterPanel";
import ActivityOverviewCard from "@/components/datasentinel/activity/ActivityOverviewCard";
import ActivitySummaryCards from "@/components/datasentinel/activity/ActivitySummaryCards";
import { DATA_SENTINEL_ROLE_ALIASES, PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  ActivityMonitoringProvider,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";
import { useStyles } from "@/app/datasentinel/style/style";

const PAGE_TITLE = "Activity Monitoring";
const PAGE_SUBTITLE =
  "Browse ingested DataSentinel activity records, verify tenant-scoped monitoring intake, and inspect captured event context.";


// User feedback: info and error states handled here. Loading and success feedback handled by child components or not applicable.
const ActivityMonitoringPageContent = () => {
  const { styles } = useStyles();
  const { errorMessage, hasTenantContext } = useActivityMonitoringState();

  // User feedback: info state (no tenant context)
  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel activity monitoring is tenant-scoped. Switch into a tenant before opening this page."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {/* User feedback: error state */}
      {errorMessage ? (
        <Alert type="error" showIcon title={errorMessage} className={styles.alert} />
      ) : null}
      {/* ...existing code... */}
      <ActivitySummaryCards />
      <ActivityAiPanel />
      <ActivityOverviewCard />
      <ActivityFilterPanel />
      <ActivityEventsTable />
    </AppShell>
  );
};

const ActivityMonitoringPage = () => (
  <ActivityMonitoringProvider>
    <ActivityMonitoringPageContent />
  </ActivityMonitoringProvider>
);

export default withAuth(ActivityMonitoringPage, {
  requiredPermission: PERMISSIONS.dataSentinelActivity,
  disallowedRoles: [...DATA_SENTINEL_ROLE_ALIASES.securityAnalyst],
  requireTenantContext: true,
});
