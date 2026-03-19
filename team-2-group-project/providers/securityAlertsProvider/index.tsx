"use client";

import React, { useCallback, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { PERMISSIONS } from "@/constants/auth/roles";
import {
  IBulkUpdateAlertStatusInput,
  ICreateIncidentNoteInput,
  ISecurityAlertDetail,
  ISecurityAlertFilters,
  ISecurityAlertFilterDraft,
  IUpdateAlertStatusInput,
} from "@/interfaces/datasentinel/alerts";
import { useAuthState } from "@/providers/authProvider";
import { hasPermission } from "@/utils/auth/roles";
import {
  bulkUpdateSecurityAlertStatus,
  createIncidentNote,
  exportIncidentReport,
  getAlertStatusHistory,
  getIncidentNotes,
  getSecurityAlertById,
  getSecurityAlertFilterOptions,
  getSecurityAlerts,
  updateSecurityAlertStatus,
} from "@/utils/datasentinel/alertsService";
import {
  AiUnavailableError,
  generateAlertAnalysis,
  generateAlertsTriageAnalysis,
} from "@/utils/datasentinel/aiService";
import { toArray } from "@/utils/helpers";
import {
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_FILTERS,
  INITIAL_STATE,
  SecurityAlertsActionContext,
  SecurityAlertsStateContext,
} from "./context";
import {
  resetSecurityAlertsState,
  setSecurityAlertSelectedIds,
  setSecurityAlertsAppliedFilters,
  setSecurityAlertsFilters,
  setSecurityAlertsPagination,
  setSecurityAlertsState,
} from "./actions";
import { SecurityAlertsReducer } from "./reducer";

const toUtcIsoString = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
};

const resolveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: { details?: string; message?: string } }
      | undefined;

    return (
      responseData?.error?.details ||
      responseData?.error?.message ||
      error.message
    );
  }

  return error instanceof Error
    ? error.message
    : "Failed to load security alerts.";
};

const triggerBrowserDownload = (bytes: ArrayBuffer, fileName: string) => {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const SecurityAlertsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTenant, permissions } = useAuthState();
  const [state, dispatch] = useReducer(SecurityAlertsReducer, INITIAL_STATE);

  const hasTenantContext = Boolean(currentTenant?.tenantId);
  const canReviewAlerts =
    hasPermission(permissions, PERMISSIONS.dataSentinelAlertsReview) ||
    hasPermission(permissions, PERMISSIONS.dataSentinelAlertsManage);
  const canExportReports = hasPermission(
    permissions,
    PERMISSIONS.dataSentinelReportsExport,
  );

  const buildRequestFilters = useCallback(
    (): ISecurityAlertFilters => ({
      keyword: state.appliedFilters.keyword.trim() || undefined,
      severity: state.appliedFilters.severity,
      status: state.appliedFilters.status,
      databaseId: state.appliedFilters.databaseId,
      startDate: toUtcIsoString(state.appliedFilters.startDate),
      endDate: toUtcIsoString(state.appliedFilters.endDate),
      skipCount: (state.currentPage - 1) * state.pageSize,
      maxResultCount: state.pageSize,
    }),
    [state.appliedFilters, state.currentPage, state.pageSize],
  );

  const loadAlerts = useCallback(
    async (refreshing = false) => {
      dispatch(
        setSecurityAlertsState(
          refreshing ? { isRefreshing: true } : { isLoading: true },
        ),
      );

      try {
        const result = await getSecurityAlerts(buildRequestFilters());
        const items = toArray(result.items);
        const total = result.totalCount ?? 0;
        dispatch(
          setSecurityAlertsState({
            alerts: items,
            totalCount: total,
            errorMessage: null,
          }),
        );
        void loadTriageAnalysis(items, total);
      } catch (error: unknown) {
        dispatch(
          setSecurityAlertsState({
            alerts: [],
            totalCount: 0,
            errorMessage: resolveErrorMessage(error),
          }),
        );
      } finally {
        dispatch(
          setSecurityAlertsState({
            isLoading: false,
            isRefreshing: false,
          }),
        );
      }
    },
    [buildRequestFilters],
  );

  const loadFilterOptions = useCallback(async () => {
    dispatch(setSecurityAlertsState({ isFilterOptionsLoading: true }));

    try {
      const result = await getSecurityAlertFilterOptions();
      dispatch(
        setSecurityAlertsState({
          filterOptions: {
            databases: toArray(result.databases),
          },
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          errorMessage: resolveErrorMessage(error),
          filterOptions: DEFAULT_FILTER_OPTIONS,
        }),
      );
    } finally {
      dispatch(setSecurityAlertsState({ isFilterOptionsLoading: false }));
    }
  }, []);

  const loadTriageAnalysis = useCallback(
    async (alerts: (typeof state)["alerts"], totalCount: number) => {
      if (alerts.length === 0) return;
      dispatch(setSecurityAlertsState({ isTriageLoading: true, triageError: null }));
      try {
        const analysis = await generateAlertsTriageAnalysis({
          totalCount,
          alerts: alerts.map((a) => ({
            title: a.title,
            severity: a.severity,
            status: a.status,
            riskScore: a.riskScore,
            relatedEventCount: a.relatedEventCount,
            triggeredAt: a.triggeredAt,
            primaryActorUser: a.primaryActorUser,
            databaseName: a.databaseName,
            tableName: a.tableName,
          })),
        });
        dispatch(setSecurityAlertsState({ triageAnalysis: analysis, triageError: null }));
      } catch (error: unknown) {
        const message =
          error instanceof AiUnavailableError
            ? error.message
            : "AI analysis is temporarily unavailable.";
        dispatch(setSecurityAlertsState({ triageAnalysis: null, triageError: message }));
        console.error("[SecurityAlertsProvider] Triage analysis failed:", error);
      } finally {
        dispatch(setSecurityAlertsState({ isTriageLoading: false }));
      }
    },
    [],
  );

  const loadAiAnalysis = useCallback(async (alert: ISecurityAlertDetail) => {
    dispatch(setSecurityAlertsState({ isAiLoading: true, aiError: null, aiAnalysis: null }));
    try {
      const analysis = await generateAlertAnalysis({ alert });
      dispatch(setSecurityAlertsState({ aiAnalysis: analysis, aiError: null }));
    } catch (error: unknown) {
      const message =
        error instanceof AiUnavailableError
          ? error.message
          : "AI analysis is temporarily unavailable.";
      dispatch(setSecurityAlertsState({ aiAnalysis: null, aiError: message }));
      console.error("[SecurityAlertsProvider] AI analysis failed:", error);
    } finally {
      dispatch(setSecurityAlertsState({ isAiLoading: false }));
    }
  }, []);

  const loadAlertDetail = useCallback(async (alertId: string) => {
    dispatch(
      setSecurityAlertsState({
        isDetailLoading: true,
        detailErrorMessage: null,
        aiAnalysis: null,
        aiError: null,
      }),
    );

    try {
      const [detail, notes, history] = await Promise.all([
        getSecurityAlertById(alertId),
        getIncidentNotes(alertId),
        getAlertStatusHistory(alertId),
      ]);

      dispatch(
        setSecurityAlertsState({
          selectedAlertId: alertId,
          selectedAlert: detail,
          notes: toArray(notes),
          history: toArray(history),
          detailErrorMessage: null,
        }),
      );

      void loadAiAnalysis(detail);
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          selectedAlertId: alertId,
          selectedAlert: null,
          notes: [],
          history: [],
          detailErrorMessage: resolveErrorMessage(error),
        }),
      );
    } finally {
      dispatch(setSecurityAlertsState({ isDetailLoading: false }));
    }
  }, [loadAiAnalysis]);

  useEffect(() => {
    if (!hasTenantContext) {
      dispatch(
        resetSecurityAlertsState({
          isLoading: false,
          isFilterOptionsLoading: false,
          hasTenantContext: false,
          canReviewAlerts: false,
          canExportReports: false,
        }),
      );
      return;
    }

    dispatch(
      setSecurityAlertsState({
        hasTenantContext: true,
        canReviewAlerts,
        canExportReports,
      }),
    );

    void loadFilterOptions();
  }, [canExportReports, canReviewAlerts, hasTenantContext, loadFilterOptions]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    void loadAlerts();
  }, [hasTenantContext, loadAlerts]);

  const setFilterValue = <K extends keyof ISecurityAlertFilterDraft>(
    key: K,
    value: ISecurityAlertFilterDraft[K],
  ) => {
    dispatch(
      setSecurityAlertsFilters({
        ...state.filters,
        [key]: value,
      }),
    );
  };

  const applyFilters = async () => {
    dispatch(setSecurityAlertsAppliedFilters(state.filters));
  };

  const resetFilters = async () => {
    dispatch(
      setSecurityAlertsState({
        filters: DEFAULT_FILTERS,
        appliedFilters: DEFAULT_FILTERS,
        currentPage: 1,
        pageSize: 25,
      }),
    );
  };

  const refresh = async () => {
    await Promise.all([
      loadAlerts(true),
      loadFilterOptions(),
      state.selectedAlertId ? loadAlertDetail(state.selectedAlertId) : Promise.resolve(),
    ]);
  };

  const openAlert = useCallback(async (alertId: string) => {
    await loadAlertDetail(alertId);
  }, [loadAlertDetail]);

  const setPagination = async (page: number, pageSize: number) => {
    dispatch(setSecurityAlertsPagination({ page, pageSize }));
  };

  const setSelectedAlertIds = (alertIds: string[]) => {
    dispatch(setSecurityAlertSelectedIds(alertIds));
  };

  const updateStatus = async (
    input: Omit<IUpdateAlertStatusInput, "alertId">,
  ) => {
    if (!state.selectedAlertId) {
      return false;
    }

    dispatch(setSecurityAlertsState({ isUpdatingStatus: true }));

    try {
      await updateSecurityAlertStatus({
        alertId: state.selectedAlertId,
        newStatus: input.newStatus,
        comment: input.comment,
      });

      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "success",
            text: "Alert status updated successfully.",
          },
          errorMessage: null,
        }),
      );

      await Promise.all([loadAlerts(true), loadAlertDetail(state.selectedAlertId)]);
      return true;
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
        }),
      );
      return false;
    } finally {
      dispatch(setSecurityAlertsState({ isUpdatingStatus: false }));
    }
  };

  const createNoteAction = async (
    input: Omit<ICreateIncidentNoteInput, "alertId">,
  ) => {
    if (!state.selectedAlertId) {
      return false;
    }

    dispatch(setSecurityAlertsState({ isCreatingNote: true }));

    try {
      await createIncidentNote({
        alertId: state.selectedAlertId,
        body: input.body,
        isInternal: input.isInternal,
      });

      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "success",
            text: "Incident note added successfully.",
          },
          errorMessage: null,
        }),
      );

      await loadAlertDetail(state.selectedAlertId);
      return true;
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
        }),
      );
      return false;
    } finally {
      dispatch(setSecurityAlertsState({ isCreatingNote: false }));
    }
  };

  const bulkUpdateStatus = async (input: IBulkUpdateAlertStatusInput) => {
    if (input.alertIds.length === 0) {
      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "error",
            text: "Select at least one new alert first.",
          },
        }),
      );
      return false;
    }

    dispatch(setSecurityAlertsState({ isBulkUpdatingStatus: true }));

    try {
      await bulkUpdateSecurityAlertStatus(input);

      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "success",
            text:
              input.newStatus === 3
                ? "Selected alerts were marked as resolved."
                : "Selected alerts were dismissed successfully.",
          },
          errorMessage: null,
          selectedAlertIds: [],
        }),
      );

      await Promise.all([
        loadAlerts(true),
        state.selectedAlertId ? loadAlertDetail(state.selectedAlertId) : Promise.resolve(),
      ]);
      return true;
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
        }),
      );
      return false;
    } finally {
      dispatch(setSecurityAlertsState({ isBulkUpdatingStatus: false }));
    }
  };

  const exportReport = async () => {
    if (!state.selectedAlertId || !state.selectedAlert) {
      return;
    }

    dispatch(setSecurityAlertsState({ isExportingReport: true }));

    try {
      const bytes = await exportIncidentReport(state.selectedAlertId);
      triggerBrowserDownload(bytes, `${state.selectedAlert.alertId}.pdf`);
    } catch (error: unknown) {
      dispatch(
        setSecurityAlertsState({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
        }),
      );
    } finally {
      dispatch(setSecurityAlertsState({ isExportingReport: false }));
    }
  };

  const retryAiAnalysis = async () => {
    if (state.selectedAlert) {
      await loadAiAnalysis(state.selectedAlert);
    }
  };

  const retryTriageAnalysis = async () => {
    await loadTriageAnalysis(state.alerts, state.totalCount);
  };

  const clearMessages = () => {
    dispatch(
      setSecurityAlertsState({
        actionMessage: null,
        errorMessage: null,
      }),
    );
  };

  return (
    <SecurityAlertsStateContext.Provider
      value={{
        ...state,
        hasTenantContext,
        canReviewAlerts,
        canExportReports,
      }}
    >
      <SecurityAlertsActionContext.Provider
        value={{
          setFilterValue,
          applyFilters,
          resetFilters,
          refresh,
          openAlert,
          setPagination,
          setSelectedAlertIds,
          updateStatus,
          bulkUpdateStatus,
          createNote: createNoteAction,
          exportReport,
          clearMessages,
          buildRequestFilters,
          retryAiAnalysis,
          retryTriageAnalysis,
        }}
      >
        {children}
      </SecurityAlertsActionContext.Provider>
    </SecurityAlertsStateContext.Provider>
  );
};

export const useSecurityAlertsState = () => {
  const context = useContext(SecurityAlertsStateContext);

  if (context === undefined) {
    throw new Error(
      "useSecurityAlertsState must be used within a SecurityAlertsProvider",
    );
  }

  return context;
};

export const useSecurityAlertsActions = () => {
  const context = useContext(SecurityAlertsActionContext);

  if (context === undefined) {
    throw new Error(
      "useSecurityAlertsActions must be used within a SecurityAlertsProvider",
    );
  }

  return context;
};
