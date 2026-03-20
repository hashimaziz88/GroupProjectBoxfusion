"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Alert } from "antd";
import AppShell from "@/components/auth/AppShell";
import IntakeResultPanel from "@/components/datasentinel/intake/IntakeResultPanel";
import IntakeSummaryCards from "@/components/datasentinel/intake/IntakeSummaryCards";
import IntakeWorkflowTabs from "@/components/datasentinel/intake/IntakeWorkflowTabs";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { IActivityEventIngestionResult } from "@/interfaces/datasentinel/intake";
import { IIntakeDatabaseOption } from "@/interfaces/datasentinel/intakeComponents";
import { useAuthState } from "@/providers/authProvider";
import { getMonitoredServers } from "@/utils/datasentinel/monitoringService";
import { resolveErrorMessage } from "@/utils/datasentinel/intakeHelpers";
import { toArray } from "@/utils/helpers";
import { IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";
import { useStyles } from "@/app/datasentinel/style/style";

const PAGE_TITLE = "Activity Intake";
const PAGE_SUBTITLE =
  "Send activity event batches, import audit log exports, or seed simulated data into the DataSentinel monitoring pipeline.";


// User feedback: loading, error, success, and info states handled here per project standard.
const ActivityIntakePageContent = () => {
  const { styles } = useStyles();
  const { currentTenant } = useAuthState();
  const hasTenantContext = Boolean(currentTenant?.tenantId);

  const [monitoredServers, setMonitoredServers] = useState<IMonitoredServerListItem[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    label: string;
    result: IActivityEventIngestionResult;
  } | null>(null);

  const allDatabases: IIntakeDatabaseOption[] = monitoredServers.flatMap((server) =>
    toArray(server.databases).map((database) => ({
      ...database,
      serverName: server.name,
    })),
  );

  const loadReferenceData = useEffectEvent(async () => {
    setIsLoadingReferences(true);

    try {
      const result = await getMonitoredServers();
      setMonitoredServers(toArray(result.items));
      setErrorMessage(null);
    } catch (error: unknown) {
      setMonitoredServers([]);
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsLoadingReferences(false);
    }
  });

  useEffect(() => {
    if (!hasTenantContext) {
      setMonitoredServers([]);
      setIsLoadingReferences(false);
      return;
    }

    void loadReferenceData();
  }, [hasTenantContext]);

  const handleResult = (label: string, result: IActivityEventIngestionResult) => {
    setLastResult({ label, result });
  };


  // User feedback: info state (no tenant context)
  if (!hasTenantContext) {
    return (
      <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel intake is tenant-scoped. Switch into a tenant before ingesting or seeding activity."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
      {/* User feedback: loading state */}
      {isLoadingReferences && (
        <Alert type="info" showIcon title="Loading reference data..." className={styles.alert} />
      )}
      {/* User feedback: error state */}
      {errorMessage ? (
        <Alert type="error" showIcon title={errorMessage} className={styles.alert} />
      ) : null}
      {/* User feedback: success state */}
      {actionMessage && actionMessage.type === "success" ? (
        <Alert
          type="success"
          showIcon
          title={actionMessage.text}
          className={styles.alert}
        />
      ) : null}
      {/* User feedback: error state for action */}
      {actionMessage && actionMessage.type === "error" ? (
        <Alert
          type="error"
          showIcon
          title={actionMessage.text}
          className={styles.alert}
        />
      ) : null}
      {/* ...existing code... */}
      <IntakeSummaryCards
        monitoredServersCount={monitoredServers.length}
        databasesCount={allDatabases.length}
        lastAcceptedCount={lastResult?.result.acceptedCount ?? 0}
      />
      <IntakeWorkflowTabs
        monitoredServers={monitoredServers}
        allDatabases={allDatabases}
        isLoadingReferences={isLoadingReferences}
        onResult={handleResult}
        onMessage={setActionMessage}
      />
      <IntakeResultPanel lastResult={lastResult} />
    </AppShell>
  );
};

export default withAuth(ActivityIntakePageContent, PERMISSIONS.dataSentinelIntake);
