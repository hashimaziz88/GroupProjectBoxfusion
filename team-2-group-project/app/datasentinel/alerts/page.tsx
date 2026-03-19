"use client";

import { Alert } from "antd";
import AppShell from "@/components/auth/AppShell";
import SecurityAlertDetailDrawer from "@/components/datasentinel/alerts/SecurityAlertDetailDrawer";
import SecurityAlertsFilterPanel from "@/components/datasentinel/alerts/SecurityAlertsFilterPanel";
import SecurityAlertsTable from "@/components/datasentinel/alerts/SecurityAlertsTable";
import { useStyles } from "@/components/datasentinel/alerts/style/style";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  SecurityAlertsProvider,
  useSecurityAlertsState,
} from "@/providers/securityAlertsProvider";

const PAGE_TITLE = "Security Alerts";
const PAGE_SUBTITLE =
  "Review tenant-scoped security alerts, inspect incident context, update triage status, and capture investigation notes.";

const SecurityAlertsPageContent = () => {
  const { styles } = useStyles();
  const { actionMessage, errorMessage, hasTenantContext } = useSecurityAlertsState();

  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel security alerts are tenant-scoped. Switch into a tenant before opening this page."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          className={styles.alert}
        />
      ) : null}
      {actionMessage ? (
        <Alert
          type={actionMessage.type}
          showIcon
          title={actionMessage.text}
          className={styles.alert}
        />
      ) : null}
      <SecurityAlertsFilterPanel />
      <SecurityAlertsTable />
      <SecurityAlertDetailDrawer />
    </AppShell>
  );
};

const SecurityAlertsPage = () => (
  <SecurityAlertsProvider>
    <SecurityAlertsPageContent />
  </SecurityAlertsProvider>
);

export default withAuth(
  SecurityAlertsPage,
  PERMISSIONS.dataSentinelAlertsView,
);
