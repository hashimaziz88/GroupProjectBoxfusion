import { createContext } from "react";
import {
  IActivityEventListItem,
  IAlertRuleListItem,
  IDashboardOverview,
  IGenerateDemoActivityInput,
  IGetActivityEventsInput,
  IGetAlertsInput,
  IGetDashboardOverviewInput,
  IImportActivityEventsInput,
  IMonitoredDatabase,
  IMonitoredServer,
  IMonitoringIntakeResult,
  ISecurityAlertDetail,
  ISecurityAlertListItem,
  IUpdateAlertRuleInput,
  IUpdateAlertStatusInput,
} from "@/interfaces/datasentinel";

export interface IDataSentinelStateContext {
  dashboardOverview?: IDashboardOverview | null;
  alerts?: ISecurityAlertListItem[] | null;
  alertsTotalCount: number;
  alertDetail?: ISecurityAlertDetail | null;
  rules?: IAlertRuleListItem[] | null;
  activityEvents?: IActivityEventListItem[] | null;
  activityTotalCount: number;
  monitoredServers?: IMonitoredServer[] | null;
  monitoredDatabases?: IMonitoredDatabase[] | null;
  intakeResult?: IMonitoringIntakeResult | null;
  isDashboardPending: boolean;
  isAlertsPending: boolean;
  isAlertDetailPending: boolean;
  isRulesPending: boolean;
  isActivityPending: boolean;
  isAssetsPending: boolean;
  isIntakePending: boolean;
  errorMessage?: string | null;
}

export interface IDataSentinelActionContext {
  loadDashboard: (input?: IGetDashboardOverviewInput) => Promise<void>;
  loadAlerts: (input: IGetAlertsInput) => Promise<void>;
  loadAlertDetail: (alertId: number) => Promise<void>;
  changeAlertStatus: (input: IUpdateAlertStatusInput) => Promise<ISecurityAlertDetail | null>;
  createAlertNote: (input: { alertId: number; body: string; isInternal: boolean }) => Promise<void>;
  loadRules: () => Promise<void>;
  saveRule: (input: IUpdateAlertRuleInput) => Promise<IAlertRuleListItem | null>;
  loadActivityEvents: (input: IGetActivityEventsInput) => Promise<void>;
  loadAssets: () => Promise<void>;
  runDemoGeneration: (input: IGenerateDemoActivityInput) => Promise<IMonitoringIntakeResult | null>;
  runActivityImport: (input: IImportActivityEventsInput) => Promise<IMonitoringIntakeResult | null>;
  clearDataSentinelError: () => void;
}

export const INITIAL_STATE: IDataSentinelStateContext = {
  dashboardOverview: null,
  alerts: [],
  alertsTotalCount: 0,
  alertDetail: null,
  rules: [],
  activityEvents: [],
  activityTotalCount: 0,
  monitoredServers: [],
  monitoredDatabases: [],
  intakeResult: null,
  isDashboardPending: false,
  isAlertsPending: false,
  isAlertDetailPending: false,
  isRulesPending: false,
  isActivityPending: false,
  isAssetsPending: false,
  isIntakePending: false,
  errorMessage: null,
};

export const DataSentinelStateContext =
  createContext<IDataSentinelStateContext>(INITIAL_STATE);
export const DataSentinelActionContext =
  createContext<IDataSentinelActionContext>(undefined!);
