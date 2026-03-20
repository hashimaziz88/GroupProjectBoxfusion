import { IActivityEventIngestionResult } from "@/interfaces/datasentinel/intake";
import { IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";

export interface IIntakeDatabaseOption {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
}

export interface IIntakeSummaryCardsProps {
  monitoredServersCount: number;
  databasesCount: number;
  lastAcceptedCount: number;
}

export interface IIntakeFormSharedProps {
  currentTenantId: number;
  monitoredServers: IMonitoredServerListItem[];
  allDatabases: IIntakeDatabaseOption[];
  isLoadingReferences: boolean;
  onResult: (label: string, result: IActivityEventIngestionResult) => void;
  onMessage: (msg: { type: "success" | "error"; text: string }) => void;
}

export interface IIntakeResultPanelProps {
  lastResult: { label: string; result: IActivityEventIngestionResult } | null;
}
