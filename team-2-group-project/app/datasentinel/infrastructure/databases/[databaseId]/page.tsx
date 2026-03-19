"use client";

import { useParams } from "next/navigation";
import InfrastructureDatabaseDetail from "@/components/datasentinel/infrastructure/InfrastructureDatabaseDetail";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Database Detail";
const PAGE_SUBTITLE =
  "Inspect a monitored database and drill through its table references.";

const DatabaseDetailPage = () => {
  const params = useParams<{ databaseId: string }>();
  const databaseId = Array.isArray(params?.databaseId)
    ? params.databaseId[0]
    : params?.databaseId;

  return (
    <InfrastructureWorkspace
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      backHref="/datasentinel/infrastructure/databases"
      backLabel="Back to databases"
    >
      {databaseId ? <InfrastructureDatabaseDetail databaseId={databaseId} /> : null}
    </InfrastructureWorkspace>
  );
};

const DatabaseDetailPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <DatabaseDetailPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  DatabaseDetailPageRoute,
  PERMISSIONS.dataSentinelInfrastructureView,
);
