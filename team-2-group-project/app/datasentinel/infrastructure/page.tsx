"use client";

import { Alert } from "antd";
import AppShell from "@/components/auth/AppShell";
import BootstrapDemoPanel from "@/components/datasentinel/infrastructure/BootstrapDemoPanel";
import CreateReferencesPanel from "@/components/datasentinel/infrastructure/CreateReferencesPanel";
import InfrastructureInventory from "@/components/datasentinel/infrastructure/InfrastructureInventory";
import InfrastructureSummaryCards from "@/components/datasentinel/infrastructure/InfrastructureSummaryCards";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  MonitoringInfrastructureProvider,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import { useStyles } from "@/app/datasentinel/style/style";

const PAGE_TITLE = "Monitoring Infrastructure";
const PAGE_SUBTITLE =
  "Inspect tenant-scoped monitored servers, databases, and tables, then create or bootstrap the references required by DataSentinel intake.";

const MonitoringInfrastructurePage = () => {
  const { styles } = useStyles();
  const { actionMessage, errorMessage, hasTenantContext } =
    useMonitoringInfrastructureState();

  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel infrastructure is tenant-scoped. Switch into a tenant before managing monitoring references."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {errorMessage ? (
        <Alert type="error" showIcon title={errorMessage} className={styles.alert} />
      ) : null}
      {actionMessage ? (
        <Alert
          type={actionMessage.type}
          showIcon
          title={actionMessage.text}
          className={styles.alert}
        />
      ) : null}
      <InfrastructureSummaryCards />
      <InfrastructureInventory />
      <CreateReferencesPanel />
      <BootstrapDemoPanel />
    </AppShell>
  );
};

const MonitoringInfrastructurePageRoute = () => (
  <MonitoringInfrastructureProvider>
    <MonitoringInfrastructurePage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  MonitoringInfrastructurePageRoute,
  PERMISSIONS.dataSentinelInfrastructureView,
);
