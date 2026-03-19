"use client";

import { createContext } from "react";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";
import {
  IDashboardActivityTrends,
  IDashboardAnomalyTimeline,
  IDashboardFilterDraft,
  IDashboardSeverityBreakdown,
  IDashboardSummary,
  IDashboardTopRisk,
} from "@/interfaces/datasentinel/dashboard";

export interface IDashboardActionMessage {
  type: "success" | "error";
  text: string;
}

export interface IDashboardStateContext {
  filters: IDashboardFilterDraft;
  appliedFilters: IDashboardFilterDraft;
  summary: IDashboardSummary;
  activityTrends: IDashboardActivityTrends;
  severityBreakdown: IDashboardSeverityBreakdown;
  anomalyTimeline: IDashboardAnomalyTimeline;
  topRisk: IDashboardTopRisk;
  recentAlerts: ISecurityAlertListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage?: string | null;
  actionMessage?: IDashboardActionMessage | null;
  hasTenantContext: boolean;
  canAccessActivity: boolean;
  canAccessAlerts: boolean;
  canAccessInfrastructure: boolean;
}

export interface IDashboardActionContext {
  setFilterValue: <K extends keyof IDashboardFilterDraft>(
    key: K,
    value: IDashboardFilterDraft[K],
  ) => void;
  applyFilters: () => Promise<void>;
  resetFilters: () => Promise<void>;
  refresh: () => Promise<void>;
  clearMessages: () => void;
}

export const DEFAULT_FILTERS: IDashboardFilterDraft = {
  windowDays: 7,
  bucketHours: 24,
  maxUsers: 5,
  maxEntities: 5,
};

export const DEFAULT_SUMMARY: IDashboardSummary = {
  windowStartUtc: "",
  windowEndUtc: "",
  totalAlerts: 0,
  criticalAlerts: 0,
  newAlerts: 0,
  totalFailedAccessAttempts: 0,
  suspiciousWriteActivityCount: 0,
  highRiskUsersCount: 0,
};

export const DEFAULT_ACTIVITY_TRENDS: IDashboardActivityTrends = {
  windowStartUtc: "",
  windowEndUtc: "",
  bucketHours: 24,
  reads: [],
  writes: [],
  failedAccess: [],
  alerts: [],
};

export const DEFAULT_SEVERITY_BREAKDOWN: IDashboardSeverityBreakdown = {
  windowStartUtc: "",
  windowEndUtc: "",
  items: [],
};

export const DEFAULT_ANOMALY_TIMELINE: IDashboardAnomalyTimeline = {
  windowStartUtc: "",
  windowEndUtc: "",
  bucketHours: 24,
  items: [],
};

export const DEFAULT_TOP_RISK: IDashboardTopRisk = {
  windowStartUtc: "",
  windowEndUtc: "",
  users: [],
  databases: [],
  tables: [],
};

export const INITIAL_STATE: IDashboardStateContext = {
  filters: DEFAULT_FILTERS,
  appliedFilters: DEFAULT_FILTERS,
  summary: DEFAULT_SUMMARY,
  activityTrends: DEFAULT_ACTIVITY_TRENDS,
  severityBreakdown: DEFAULT_SEVERITY_BREAKDOWN,
  anomalyTimeline: DEFAULT_ANOMALY_TIMELINE,
  topRisk: DEFAULT_TOP_RISK,
  recentAlerts: [],
  isLoading: true,
  isRefreshing: false,
  errorMessage: null,
  actionMessage: null,
  hasTenantContext: false,
  canAccessActivity: false,
  canAccessAlerts: false,
  canAccessInfrastructure: false,
};

export const DashboardStateContext =
  createContext<IDashboardStateContext>(INITIAL_STATE);
export const DashboardActionContext =
  createContext<IDashboardActionContext>(undefined!);
