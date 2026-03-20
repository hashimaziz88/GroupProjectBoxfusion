"use client";

import InfrastructureTablesTable from "@/components/datasentinel/infrastructure/InfrastructureTablesTable";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Monitored Tables";
const PAGE_SUBTITLE =
  "Inspect table-level monitoring references with server and database filtering.";

const MonitoringTablesPage = () => (
  <InfrastructureWorkspace
    title={PAGE_TITLE}
    subtitle={PAGE_SUBTITLE}
    backHref="/datasentinel/infrastructure"
    backLabel="Back to infrastructure"
  >
    <InfrastructureTablesTable />
  </InfrastructureWorkspace>
);

const MonitoringTablesPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <MonitoringTablesPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  MonitoringTablesPageRoute,
  {
    requiredPermissionsAny: [
      PERMISSIONS.dataSentinelInfrastructureView,
      PERMISSIONS.dataSentinelInfrastructureManage,
    ],
    requireTenantContext: true,
  },
);
