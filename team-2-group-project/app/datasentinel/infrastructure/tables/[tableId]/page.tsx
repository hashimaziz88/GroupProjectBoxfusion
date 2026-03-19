"use client";

import { useParams } from "next/navigation";
import InfrastructureTableDetail from "@/components/datasentinel/infrastructure/InfrastructureTableDetail";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Table Detail";
const PAGE_SUBTITLE =
  "Inspect a specific table reference and its parent database and server context.";

const TableDetailPage = () => {
  const params = useParams<{ tableId: string }>();
  const tableId = Array.isArray(params?.tableId)
    ? params.tableId[0]
    : params?.tableId;

  return (
    <InfrastructureWorkspace
      title={PAGE_TITLE}
      subtitle={PAGE_SUBTITLE}
      backHref="/datasentinel/infrastructure/tables"
      backLabel="Back to tables"
    >
      {tableId ? <InfrastructureTableDetail tableId={tableId} /> : null}
    </InfrastructureWorkspace>
  );
};

const TableDetailPageRoute = () => (
  <MonitoringInfrastructureProvider>
    <TableDetailPage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  TableDetailPageRoute,
  PERMISSIONS.dataSentinelInfrastructureView,
);
