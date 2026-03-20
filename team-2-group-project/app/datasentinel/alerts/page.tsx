"use client";

import AlertsTriagePanel from "@/components/datasentinel/alerts/AlertsTriagePanel";
import SecurityAlertsFilterPanel from "@/components/datasentinel/alerts/SecurityAlertsFilterPanel";
import SecurityAlertsTable from "@/components/datasentinel/alerts/SecurityAlertsTable";
import SecurityAlertsWorkspace from "@/components/datasentinel/alerts/SecurityAlertsWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { SecurityAlertsProvider } from "@/providers/securityAlertsProvider";

const PAGE_TITLE = "Security Alerts";
const PAGE_SUBTITLE =
  "Review tenant-scoped security alerts, inspect incident context, update triage status, and capture investigation notes.";

const SecurityAlertsPageContent = () => (
  <SecurityAlertsWorkspace title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
    <AlertsTriagePanel />
    <SecurityAlertsFilterPanel />
    <SecurityAlertsTable />
  </SecurityAlertsWorkspace>
);

const SecurityAlertsPage = () => (
  <SecurityAlertsProvider>
    <SecurityAlertsPageContent />
  </SecurityAlertsProvider>
);

export default withAuth(
  SecurityAlertsPage,
  {
    requiredPermissionsAny: [
      PERMISSIONS.dataSentinelAlertsView,
      PERMISSIONS.dataSentinelAlertsReview,
      PERMISSIONS.dataSentinelAlertsManage,
    ],
    requireTenantContext: true,
  },
);
