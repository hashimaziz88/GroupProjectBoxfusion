"use client";

import InfrastructureDatabasesTable from "@/components/datasentinel/infrastructure/InfrastructureDatabasesTable";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Monitored Databases";
const PAGE_SUBTITLE =
  "Browse monitored databases independently, with server-aware filtering and drill-down into tables.";

const MonitoringDatabasesPage = () => (
  <InfrastructureWorkspace
    title={PAGE_TITLE}
    subtitle={PAGE_SUBTITLE}
    backHref="/datasentinel/infrastructure"
    backLabel="Back to infrastructure"
  >
    <InfrastructureDatabasesTable />
  </InfrastructureWorkspace>
);

const MonitoringDatabasesPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <MonitoringDatabasesPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  MonitoringDatabasesPageRoute,
  PERMISSIONS.dataSentinelInfrastructureView,
);
