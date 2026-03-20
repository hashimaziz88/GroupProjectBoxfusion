"use client";

import { Alert, Skeleton, Space } from "antd";
import AppShell from "@/components/auth/AppShell";
import ReportExportControls from "@/components/datasentinel/reports/ReportExportControls";
import ReportExportPackages from "@/components/datasentinel/reports/ReportExportPackages";
import ReportExportSummary from "@/components/datasentinel/reports/ReportExportSummary";
import ReportIncidentPicker from "@/components/datasentinel/reports/ReportIncidentPicker";
import { useStyles } from "@/components/datasentinel/reports/style/style";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  ReportExportProvider,
  useReportExportActions,
  useReportExportState,
} from "@/providers/reportExportProvider";

const PAGE_TITLE = "Reports & Exports";
const PAGE_SUBTITLE =
  "Generate alert, activity, and incident report files for the active tenant without duplicating the dashboard.";


// User feedback: loading, error, success, and info states handled here per project standard.
const ReportExportPageContent = () => {
  const { styles } = useStyles();
  const { clearMessages } = useReportExportActions();
  const { actionMessage, errorMessage, hasTenantContext, isLoading, isRefreshing } =
    useReportExportState();


  // User feedback: info state (no tenant context)
  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="Reports are tenant-scoped. Switch into a tenant before opening this page."
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
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <ReportExportControls />
        {/* User feedback: loading state */}
        {isLoading && !isRefreshing ? (
          <Skeleton active paragraph={{ rows: 14 }} />
        ) : (
          <>
            <ReportExportSummary />
            <div className={styles.exportGrid}>
              <ReportExportPackages />
              <ReportIncidentPicker />
            </div>
          </>
        )}
      </Space>
    </AppShell>
  );
};

const ReportExportPage = () => (
  <ReportExportProvider>
    <ReportExportPageContent />
  </ReportExportProvider>
);

export default withAuth(
  ReportExportPage,
  PERMISSIONS.dataSentinelReportsExport,
);
