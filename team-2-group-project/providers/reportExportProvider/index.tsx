"use client";

import React, { useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { useAuthState } from "@/providers/authProvider";
import { resolveAbpErrorMessage } from "@/utils/abp";
import {
  canAccessDataSentinelActivity,
  canAccessDataSentinelAlerts,
} from "@/utils/auth/roles";
import { getActivityEvents } from "@/utils/datasentinel/activityService";
import {
  exportIncidentReport,
  getSecurityAlerts,
} from "@/utils/datasentinel/alertsService";
import {
  downloadCsvFile,
} from "@/utils/datasentinel/analyticsExport";
import { downloadReportBundlePdf } from "@/utils/datasentinel/reportBundlePdf";
import { toArray } from "@/utils/helpers";
import {
  ReportExportActionContext,
  ReportExportStateContext,
  INITIAL_STATE,
} from "./context";
import { resetReportExportState, setReportExportState } from "./actions";
import { ReportExportReducer } from "./reducer";

const resolveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "A report export dependency is not available on this backend yet.";
  }

  return resolveAbpErrorMessage(error, "Failed to load report data.");
};

const formatDateStamp = () =>
  new Date().toISOString().replace(/[:.]/g, "-");

const triggerPdfDownload = (bytes: ArrayBuffer, fileName: string) => {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const ReportExportProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTenant, permissions, user } = useAuthState();
  const [state, dispatch] = useReducer(ReportExportReducer, INITIAL_STATE);
  const hasTenantContext = Boolean(currentTenant?.tenantId);
  const canAccessAlerts = canAccessDataSentinelAlerts(permissions);
  const canAccessActivity = canAccessDataSentinelActivity(permissions, user?.roles);

  useEffect(() => {
    if (!hasTenantContext) {
      dispatch(
        resetReportExportState({
          hasTenantContext: false,
          canAccessAlerts,
          canAccessActivity,
          isLoading: false,
          isRefreshing: false,
        }),
      );
      return;
    }

    dispatch(
      setReportExportState({
        hasTenantContext: true,
        canAccessAlerts,
        canAccessActivity,
      }),
    );
  }, [canAccessActivity, canAccessAlerts, hasTenantContext]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    let cancelled = false;
    const startDate = new Date(
      Date.now() - Math.max(state.windowDays, 1) * 24 * 60 * 60 * 1000,
    ).toISOString();

    const load = async () => {
      dispatch(
        setReportExportState({
          isLoading: true,
          isRefreshing: false,
          errorMessage: null,
        }),
      );

      try {
        const [alertsResponse, activityResponse] = await Promise.all([
          canAccessAlerts
            ? getSecurityAlerts({
                startDate,
                skipCount: 0,
                maxResultCount: 100,
              })
            : Promise.resolve({ items: [], totalCount: 0 }),
          canAccessActivity
            ? getActivityEvents({
                startDate,
                skipCount: 0,
                maxResultCount: 100,
                sortDescending: true,
              })
            : Promise.resolve({ items: [], totalCount: 0 }),
        ]);

        if (cancelled) {
          return;
        }

        const alerts = toArray(alertsResponse.items);
        dispatch(
          setReportExportState({
            alerts,
            activityEvents: toArray(activityResponse.items),
            isLoading: false,
            isRefreshing: false,
            errorMessage: null,
          }),
        );
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        dispatch(
          setReportExportState({
            isLoading: false,
            isRefreshing: false,
            errorMessage: resolveErrorMessage(error),
          }),
        );
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    canAccessActivity,
    canAccessAlerts,
    hasTenantContext,
    state.reloadToken,
    state.windowDays,
  ]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    const nextSelectedAlertId =
      state.alerts.some((item) => item.id === state.selectedAlertId)
        ? state.selectedAlertId
        : state.alerts[0]?.id ?? null;

    if (nextSelectedAlertId !== state.selectedAlertId) {
      dispatch(setReportExportState({ selectedAlertId: nextSelectedAlertId }));
    }
  }, [hasTenantContext, state.alerts, state.selectedAlertId]);

  const runExport = async (
    key: string,
    action: () => Promise<void> | void,
    successText: string,
  ) => {
    dispatch(setReportExportState({ exportingKey: key }));

    try {
      await action();
      dispatch(
        setReportExportState({
          actionMessage: { type: "success", text: successText },
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setReportExportState({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
        }),
      );
    } finally {
      dispatch(setReportExportState({ exportingKey: null }));
    }
  };

  const refresh = async () => {
    dispatch(
      setReportExportState({
        isRefreshing: true,
        reloadToken: state.reloadToken + 1,
        actionMessage: {
          type: "success",
          text: "Report source data refreshed.",
        },
      }),
    );
  };

  const clearMessages = () => {
    dispatch(
      setReportExportState({
        actionMessage: null,
        errorMessage: null,
      }),
    );
  };

  const exportBundlePdf = async () =>
    runExport(
      "snapshot",
      () => {
        if (!hasTenantContext) {
          throw new Error("Switch into a tenant before exporting report bundles.");
        }

        if (!canAccessAlerts && !canAccessActivity) {
          throw new Error(
            "You do not have permission to export the current report bundle.",
          );
        }

        return downloadReportBundlePdf({
          tenancyName: currentTenant?.tenancyName ?? null,
          windowDays: state.windowDays,
          alerts: state.alerts,
          activityEvents: state.activityEvents,
        });
      },
      "Report bundle PDF exported.",
    );

  const exportAlertsCsv = async () =>
    runExport(
      "alerts",
      () => {
        if (!canAccessAlerts) {
          throw new Error("You do not have permission to export alert registers.");
        }

        downloadCsvFile(
          `datasentinel-alerts-${formatDateStamp()}.csv`,
          [
            "AlertId",
            "Title",
            "Severity",
            "Status",
            "RiskScore",
            "TriggeredAt",
            "Server",
            "Database",
            "Table",
            "ActorUser",
            "ActorIp",
            "RelatedEventCount",
          ],
          state.alerts.map((alert) => [
            alert.alertId,
            alert.title,
            alert.severity,
            alert.status,
            alert.riskScore,
            alert.triggeredAt,
            alert.serverName,
            alert.databaseName,
            alert.tableName,
            alert.primaryActorUser,
            alert.primaryActorIp,
            alert.relatedEventCount,
          ]),
        );
      },
      "Alerts CSV exported.",
    );

  const exportActivityCsv = async () =>
    runExport(
      "activity",
      () => {
        if (!canAccessActivity) {
          throw new Error(
            "You do not have permission to export activity registers.",
          );
        }

        downloadCsvFile(
          `datasentinel-activity-${formatDateStamp()}.csv`,
          [
            "EventId",
            "EventTime",
            "EventType",
            "Operation",
            "Severity",
            "Database",
            "ObjectName",
            "ActorUser",
            "ActorIp",
            "RowsAffected",
            "DurationMs",
            "IsSuccess",
            "IsOutOfHours",
            "FailureReason",
          ],
          state.activityEvents.map((event) => [
            event.eventId,
            event.eventTime,
            event.eventType,
            event.operation,
            event.severity,
            event.databaseName,
            event.objectName,
            event.actorUser,
            event.actorIp,
            event.rowsAffected,
            event.durationMs,
            event.isSuccess,
            event.isOutOfHours,
            event.failureReason,
          ]),
        );
      },
      "Activity CSV exported.",
    );

  const exportIncidentPdf = async () =>
    runExport("incident", async () => {
      if (!canAccessAlerts) {
        throw new Error("You do not have permission to export incident reports.");
      }

      if (!state.selectedAlertId) {
        throw new Error("Select an alert before exporting an incident report.");
      }

      const selectedAlert = state.alerts.find((item) => item.id === state.selectedAlertId);
      const bytes = await exportIncidentReport(state.selectedAlertId);
      triggerPdfDownload(
        bytes,
        `${selectedAlert?.alertId ?? "incident-report"}.pdf`,
      );
    }, "Incident report exported.");

  return (
    <ReportExportStateContext.Provider
      value={{
        ...state,
        hasTenantContext,
        canAccessAlerts,
        canAccessActivity,
      }}
    >
      <ReportExportActionContext.Provider
        value={{
          setWindowDays: (value) =>
            dispatch(setReportExportState({ windowDays: value })),
          refresh,
          clearMessages,
          setSelectedAlertId: (alertId) =>
            dispatch(setReportExportState({ selectedAlertId: alertId })),
          exportBundlePdf,
          exportAlertsCsv,
          exportActivityCsv,
          exportIncidentPdf,
        }}
      >
        {children}
      </ReportExportActionContext.Provider>
    </ReportExportStateContext.Provider>
  );
};

export const useReportExportState = () => {
  const context = useContext(ReportExportStateContext);

  if (context === undefined) {
    throw new Error(
      "useReportExportState must be used within a ReportExportProvider",
    );
  }

  return context;
};

export const useReportExportActions = () => {
  const context = useContext(ReportExportActionContext);

  if (context === undefined) {
    throw new Error(
      "useReportExportActions must be used within a ReportExportProvider",
    );
  }

  return context;
};
