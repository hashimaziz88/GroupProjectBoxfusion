"use client";

import BootstrapDemoPanel from "@/components/datasentinel/infrastructure/BootstrapDemoPanel";
import CreateReferencesPanel from "@/components/datasentinel/infrastructure/CreateReferencesPanel";
import InfrastructureDirectory from "@/components/datasentinel/infrastructure/InfrastructureDirectory";
import InfrastructureSummaryCards from "@/components/datasentinel/infrastructure/InfrastructureSummaryCards";
import InfrastructureWorkspace from "@/components/datasentinel/infrastructure/InfrastructureWorkspace";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { MonitoringInfrastructureProvider } from "@/providers/monitoringInfrastructureProvider";

const PAGE_TITLE = "Monitoring Infrastructure";
const PAGE_SUBTITLE =
  "Start from the overview, then drill into dedicated server, database, and table routes while keeping create/bootstrap flows on this hub page.";

const MonitoringInfrastructurePage = () => (
  <InfrastructureWorkspace title={PAGE_TITLE} subtitle={PAGE_SUBTITLE}>
    <InfrastructureSummaryCards />
    <InfrastructureDirectory />
    <CreateReferencesPanel />
    <BootstrapDemoPanel />
  </InfrastructureWorkspace>
);

const MonitoringInfrastructurePageRoute = () => (
  <MonitoringInfrastructureProvider>
    <MonitoringInfrastructurePage />
  </MonitoringInfrastructureProvider>
);

export default withAuth(
  MonitoringInfrastructurePageRoute,
  PERMISSIONS.dataSentinelInfrastructureView,
);
