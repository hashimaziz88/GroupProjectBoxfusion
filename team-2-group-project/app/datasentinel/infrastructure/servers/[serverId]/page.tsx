"use client";

import { useParams } from "next/navigation";
import InfrastructureServerDetail from "@/components/datasentinel/infrastructure/InfrastructureServerDetail";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Server Detail";
const PAGE_SUBTITLE =
  "Review a monitored server in detail and drill through its related databases.";

const ServerDetailPage = () => {
  const params = useParams<{ serverId: string }>();
  const serverId = Array.isArray(params?.serverId)
    ? params.serverId[0]
    : params?.serverId;

  return (
    <InfrastructureWorkspace
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      backHref="/datasentinel/infrastructure/servers"
      backLabel="Back to servers"
    >
      {serverId ? <InfrastructureServerDetail serverId={serverId} /> : null}
    </InfrastructureWorkspace>
  );
};

const ServerDetailPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <ServerDetailPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  ServerDetailPageRoute,
  {
    requiredPermissionsAny: [
      PERMISSIONS.dataSentinelInfrastructureView,
      PERMISSIONS.dataSentinelInfrastructureManage,
    ],
    requireTenantContext: true,
  },
);
