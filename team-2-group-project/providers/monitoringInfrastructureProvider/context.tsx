"use client";

import { createContext } from "react";
import {
  IBootstrapMonitoringDemoInput,
  IBootstrapMonitoringDemoResult,
  ICreateMonitoredDatabaseInput,
  ICreateMonitoredServerInput,
  ICreateMonitoredTableInput,
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
  IMonitoredTableListItem,
} from "@/interfaces/datasentinel/monitoring";

export interface IMonitoringActionMessage {
  type: "success" | "error";
  text: string;
}

export interface IMonitoringInfrastructureStateContext {
  servers: IMonitoredServerListItem[];
  databaseItems: IMonitoredDatabaseListItem[];
  tableItems: IMonitoredTableListItem[];
  allDatabases: IMonitoredDatabaseListItem[];
  allTables: IMonitoredTableListItem[];
  availableDatabases: IMonitoredDatabaseListItem[];
  selectedServerId?: string;
  selectedDatabaseId?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  isDatabaseLoading: boolean;
  isTableLoading: boolean;
  hasTenantContext: boolean;
  canManageInfrastructure: boolean;
  errorMessage?: string | null;
  actionMessage?: IMonitoringActionMessage | null;
  bootstrapResult?: IBootstrapMonitoringDemoResult | null;
}

export interface IMonitoringInfrastructureActionContext {
  setSelectedServerId: (serverId?: string) => void;
  setSelectedDatabaseId: (databaseId?: string) => void;
  clearMessages: () => void;
  refreshInfrastructure: () => Promise<void>;
  createServer: (input: ICreateMonitoredServerInput) => Promise<boolean>;
  createDatabase: (input: ICreateMonitoredDatabaseInput) => Promise<boolean>;
  createTable: (input: ICreateMonitoredTableInput) => Promise<boolean>;
  bootstrapDemo: (input: IBootstrapMonitoringDemoInput) => Promise<boolean>;
}

export const INITIAL_STATE: IMonitoringInfrastructureStateContext = {
  servers: [],
  databaseItems: [],
  tableItems: [],
  allDatabases: [],
  allTables: [],
  availableDatabases: [],
  selectedServerId: undefined,
  selectedDatabaseId: undefined,
  isLoading: true,
  isRefreshing: false,
  isDatabaseLoading: false,
  isTableLoading: false,
  hasTenantContext: false,
  canManageInfrastructure: false,
  errorMessage: null,
  actionMessage: null,
  bootstrapResult: null,
};

export const MonitoringInfrastructureStateContext =
  createContext<IMonitoringInfrastructureStateContext>(INITIAL_STATE);
export const MonitoringInfrastructureActionContext =
  createContext<IMonitoringInfrastructureActionContext>(undefined!);
