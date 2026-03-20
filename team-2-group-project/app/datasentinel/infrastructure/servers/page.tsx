"use client";

import InfrastructureServersTable from "@/components/datasentinel/infrastructure/InfrastructureServersTable";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Monitored Servers";
const PAGE_SUBTITLE =
  "Inspect tenant-scoped monitored servers and drill into the databases attached to each server.";

const MonitoringServersPage = () => (
  <InfrastructureWorkspace
    title={PAGE_TITLE}
    subtitle={PAGE_SUBTITLE}
    backHref="/datasentinel/infrastructure"
    backLabel="Back to infrastructure"
  >
    <InfrastructureServersTable />
  </InfrastructureWorkspace>
);

const MonitoringServersPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <MonitoringServersPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  MonitoringServersPageRoute,
  {
    requiredPermissionsAny: [
      PERMISSIONS.dataSentinelInfrastructureView,
      PERMISSIONS.dataSentinelInfrastructureManage,
    ],
    requireTenantContext: true,
  },
);
