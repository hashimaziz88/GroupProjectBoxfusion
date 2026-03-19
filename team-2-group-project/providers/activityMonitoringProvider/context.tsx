"use client";

import { createContext } from "react";
import {
  ActivityTab,
  IActivityEventFilters,
  IActivityEventListItem,
  IActivityFilterDraft,
  IActivityFilterOptions,
  IActivitySummary,
} from "@/interfaces/datasentinel/activity";
import { IAiActivityAnalysis } from "@/utils/datasentinel/aiService";

export interface IActivityMonitoringStateContext {
  filters: IActivityFilterDraft;
  appliedFilters: IActivityFilterDraft;
  events: IActivityEventListItem[];
  filterOptions: IActivityFilterOptions;
  summary: IActivitySummary;
  activeTab: ActivityTab;
  isLoading: boolean;
  isRefreshing: boolean;
  isSummaryLoading: boolean;
  errorMessage?: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  hasTenantContext: boolean;
  aiAnalysis: IAiActivityAnalysis | null;
  isAiLoading: boolean;
  aiError: string | null;
}

export interface IActivityMonitoringActionContext {
  setFilterValue: <K extends keyof IActivityFilterDraft>(
    key: K,
    value: IActivityFilterDraft[K],
  ) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  refresh: () => Promise<void>;
  setActiveTab: (tab: ActivityTab) => Promise<void>;
  setPagination: (page: number, pageSize: number) => Promise<void>;
  buildRequestFilters: () => IActivityEventFilters;
  retryAiAnalysis: () => Promise<void>;
}

export const DEFAULT_FILTERS: IActivityFilterDraft = {
  keyword: "",
  serverId: undefined,
  databaseId: undefined,
  actorUser: undefined,
  actorIp: undefined,
  operation: undefined,
  eventType: undefined,
  severity: undefined,
  status: "all",
  startDate: "",
  endDate: "",
  sortDescending: true,
};

export const DEFAULT_FILTER_OPTIONS: IActivityFilterOptions = {
  databases: [],
  servers: [],
  users: [],
  ipAddresses: [],
  operations: [],
};

export const DEFAULT_SUMMARY: IActivitySummary = {
  totalEvents: 0,
  readOps: 0,
  writeOps: 0,
  authEvents: 0,
  privilegedOps: 0,
  suspiciousActivityCount: 0,
  failedEventsCount: 0,
};

export const INITIAL_STATE: IActivityMonitoringStateContext = {
  filters: DEFAULT_FILTERS,
  appliedFilters: DEFAULT_FILTERS,
  events: [],
  filterOptions: DEFAULT_FILTER_OPTIONS,
  summary: DEFAULT_SUMMARY,
  activeTab: "all",
  isLoading: true,
  isRefreshing: false,
  isSummaryLoading: true,
  errorMessage: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 25,
  hasTenantContext: false,
  aiAnalysis: null,
  isAiLoading: false,
  aiError: null,
};

export const ActivityMonitoringStateContext =
  createContext<IActivityMonitoringStateContext>(INITIAL_STATE);
export const ActivityMonitoringActionContext =
  createContext<IActivityMonitoringActionContext>(undefined!);
