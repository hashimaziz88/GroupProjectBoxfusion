"use client";

import { Alert, Skeleton, Space } from "antd";
import AppShell from "@/components/auth/AppShell";
import DashboardAiPanel from "@/components/datasentinel/dashboard/DashboardAiPanel";
import DashboardCharts from "@/components/datasentinel/dashboard/DashboardCharts";
import DashboardFilters from "@/components/datasentinel/dashboard/DashboardFilters";
import DashboardOverview from "@/components/datasentinel/dashboard/DashboardOverview";
import DashboardRecentAlerts from "@/components/datasentinel/dashboard/DashboardRecentAlerts";
import DashboardRiskPanels from "@/components/datasentinel/dashboard/DashboardRiskPanels";
import { useStyles } from "@/components/datasentinel/dashboard/style/style";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  DashboardProvider,
  useDashboardActions,
  useDashboardState,
} from "@/providers/dashboardProvider";

const PAGE_TITLE = "Security Dashboard";
const PAGE_SUBTITLE =
  "Monitor tenant risk posture, spot alert and activity trends, and jump into the most suspicious actors and entities.";


// User feedback: loading, error, success, and info states handled here per project standard.
const DashboardPageContent = () => {
  const { styles } = useStyles();
  const { clearMessages } = useDashboardActions();
  const {
    actionMessage,
    errorMessage,
    hasTenantContext,
    isLoading,
    isRefreshing,
  } = useDashboardState();


  // User feedback: info state (no tenant context)
  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel dashboard insights are tenant-scoped. Switch into a tenant before opening this page."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {/* User feedback: error state */}
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          closable={{ onClose: clearMessages }}
          className={styles.alert}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {/* User feedback: success state */}
      {actionMessage && actionMessage.type === "success" ? (
        <Alert
          type="success"
          showIcon
          title={actionMessage.text}
          closable={{ onClose: clearMessages }}
          className={styles.alert}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {/* User feedback: error state for action */}
      {actionMessage && actionMessage.type === "error" ? (
        <Alert
          type="error"
          showIcon
          title={actionMessage.text}
          closable={{ onClose: clearMessages }}
          className={styles.alert}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      <Space orientation="vertical" size={18} style={{ width: "100%" }}>
        <DashboardFilters />
        {/* User feedback: loading state */}
        {isLoading && !isRefreshing ? (
          <Skeleton active paragraph={{ rows: 16 }} />
        ) : (
          <>
            <DashboardAiPanel />
            <DashboardOverview />
            <DashboardCharts />
            <DashboardRiskPanels />
            <DashboardRecentAlerts />
          </>
        )}
      </Space>
    </AppShell>
  );
};

const DashboardPage = () => (
  <DashboardProvider>
    <DashboardPageContent />
  </DashboardProvider>
);

export default withAuth(DashboardPage, PERMISSIONS.dataSentinelDashboard);
