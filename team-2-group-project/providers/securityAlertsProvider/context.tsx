"use client";

import { createContext } from "react";
import {
  IAlertStatusHistoryItem,
  IBulkUpdateAlertStatusInput,
  ICreateIncidentNoteInput,
  IIncidentNote,
  ISecurityAlertDetail,
  ISecurityAlertFilterDraft,
  ISecurityAlertFilterOptions,
  ISecurityAlertFilters,
  ISecurityAlertListItem,
  IUpdateAlertStatusInput,
} from "@/interfaces/datasentinel/alerts";
import { IAiAlertAnalysis, IAiAlertsTriageAnalysis } from "@/utils/datasentinel/aiService";

export interface ISecurityAlertsActionMessage {
  type: "success" | "error";
  text: string;
}

export interface ISecurityAlertsStateContext {
  filters: ISecurityAlertFilterDraft;
  appliedFilters: ISecurityAlertFilterDraft;
  alerts: ISecurityAlertListItem[];
  filterOptions: ISecurityAlertFilterOptions;
  selectedAlertId?: string;
  selectedAlert?: ISecurityAlertDetail | null;
  notes: IIncidentNote[];
  history: IAlertStatusHistoryItem[];
  selectedAlertIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  isDetailLoading: boolean;
  isFilterOptionsLoading: boolean;
  isUpdatingStatus: boolean;
  isBulkUpdatingStatus: boolean;
  isCreatingNote: boolean;
  isExportingReport: boolean;
  errorMessage?: string | null;
  detailErrorMessage?: string | null;
  actionMessage?: ISecurityAlertsActionMessage | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasTenantContext: boolean;
  canReviewAlerts: boolean;
  canExportReports: boolean;
  aiAnalysis: IAiAlertAnalysis | null;
  isAiLoading: boolean;
  aiError: string | null;
  triageAnalysis: IAiAlertsTriageAnalysis | null;
  isTriageLoading: boolean;
  triageError: string | null;
}

export interface ISecurityAlertsActionContext {
  setFilterValue: <K extends keyof ISecurityAlertFilterDraft>(
    key: K,
    value: ISecurityAlertFilterDraft[K],
  ) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  refresh: () => Promise<void>;
  openAlert: (alertId: string) => Promise<void>;
  setPagination: (page: number, pageSize: number) => Promise<void>;
  setSelectedAlertIds: (alertIds: string[]) => void;
  updateStatus: (input: Omit<IUpdateAlertStatusInput, "alertId">) => Promise<boolean>;
  bulkUpdateStatus: (
    input: IBulkUpdateAlertStatusInput,
  ) => Promise<boolean>;
  createNote: (input: Omit<ICreateIncidentNoteInput, "alertId">) => Promise<boolean>;
  exportReport: () => Promise<void>;
  clearMessages: () => void;
  buildRequestFilters: () => ISecurityAlertFilters;
  retryAiAnalysis: () => Promise<void>;
  retryTriageAnalysis: () => Promise<void>;
}

export const DEFAULT_FILTERS: ISecurityAlertFilterDraft = {
  keyword: "",
  severity: undefined,
  status: undefined,
  databaseId: undefined,
  startDate: "",
  endDate: "",
};

export const DEFAULT_FILTER_OPTIONS: ISecurityAlertFilterOptions = {
  databases: [],
};

export const INITIAL_STATE: ISecurityAlertsStateContext = {
  filters: DEFAULT_FILTERS,
  appliedFilters: DEFAULT_FILTERS,
  alerts: [],
  filterOptions: DEFAULT_FILTER_OPTIONS,
  selectedAlertId: undefined,
  selectedAlert: null,
  notes: [],
  history: [],
  selectedAlertIds: [],
  isLoading: true,
  isRefreshing: false,
  isDetailLoading: false,
  isFilterOptionsLoading: true,
  isUpdatingStatus: false,
  isBulkUpdatingStatus: false,
  isCreatingNote: false,
  isExportingReport: false,
  errorMessage: null,
  detailErrorMessage: null,
  actionMessage: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,
  hasTenantContext: false,
  canReviewAlerts: false,
  canExportReports: false,
  aiAnalysis: null,
  isAiLoading: false,
  aiError: null,
  triageAnalysis: null,
  isTriageLoading: false,
  triageError: null,
};

export const SecurityAlertsStateContext =
  createContext<ISecurityAlertsStateContext>(INITIAL_STATE);
export const SecurityAlertsActionContext =
  createContext<ISecurityAlertsActionContext>(undefined!);
