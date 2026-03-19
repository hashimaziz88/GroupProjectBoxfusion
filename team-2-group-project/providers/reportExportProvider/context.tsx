"use client";

import { createContext } from "react";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";

export interface IReportExportActionMessage {
  type: "success" | "error";
  text: string;
}

export interface IReportExportStateContext {
  windowDays: number;
  alerts: ISecurityAlertListItem[];
  activityEvents: IActivityEventListItem[];
  selectedAlertId: string | null;
  reloadToken: number;
  isLoading: boolean;
  isRefreshing: boolean;
  exportingKey: string | null;
  errorMessage: string | null;
  actionMessage: IReportExportActionMessage | null;
  hasTenantContext: boolean;
  canAccessAlerts: boolean;
  canAccessActivity: boolean;
}

export interface IReportExportActionContext {
  setWindowDays: (value: number) => void;
  refresh: () => Promise<void>;
  clearMessages: () => void;
  setSelectedAlertId: (alertId: string | null) => void;
  exportBundlePdf: () => Promise<void>;
  exportAlertsCsv: () => Promise<void>;
  exportActivityCsv: () => Promise<void>;
  exportIncidentPdf: () => Promise<void>;
}

export const INITIAL_STATE: IReportExportStateContext = {
  windowDays: 30,
  alerts: [],
  activityEvents: [],
  selectedAlertId: null,
  reloadToken: 0,
  isLoading: true,
  isRefreshing: false,
  exportingKey: null,
  errorMessage: null,
  actionMessage: null,
  hasTenantContext: false,
  canAccessAlerts: false,
  canAccessActivity: false,
};

export const ReportExportStateContext =
  createContext<IReportExportStateContext>(INITIAL_STATE);
export const ReportExportActionContext =
  createContext<IReportExportActionContext>(undefined!);
