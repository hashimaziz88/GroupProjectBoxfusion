"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Alert } from "antd";
import SecurityAlertDetailView from "@/components/datasentinel/alerts/SecurityAlertDetailView";
import SecurityAlertsWorkspace from "@/components/datasentinel/alerts/SecurityAlertsWorkspace";
import { useStyles } from "@/components/datasentinel/alerts/style/style";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  SecurityAlertsProvider,
  useSecurityAlertsActions,
} from "@/providers/securityAlertsProvider";

const PAGE_TITLE = "Alert Detail";
const PAGE_SUBTITLE =
  "Review alert context, investigation notes, status history, and reporting actions.";

const SecurityAlertDetailPageContent = () => {
  const params = useParams<{ alertId: string }>();
  const { styles } = useStyles();
  const { openAlert } = useSecurityAlertsActions();

  const alertId = Array.isArray(params?.alertId)
    ? params.alertId[0]
    : params?.alertId;

  useEffect(() => {
    if (!alertId) {
      return;
    }

    void openAlert(alertId);
  }, [alertId, openAlert]);

  return (
    <SecurityAlertsWorkspace
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      backHref="/datasentinel/alerts"
      backLabel="Back to alerts"
    >
      {alertId ? (
        <SecurityAlertDetailView />
      ) : (
        <Alert
          type="error"
          showIcon
          title="The alert identifier is missing from the route."
          className={styles.alert}
        />
      )}
    </SecurityAlertsWorkspace>
  );
};

const SecurityAlertDetailPage = () => (
  <SecurityAlertsProvider>
    <SecurityAlertDetailPageContent />
  </SecurityAlertsProvider>
);

export default withAuth(
  SecurityAlertDetailPage,
  PERMISSIONS.dataSentinelAlertsView,
);
