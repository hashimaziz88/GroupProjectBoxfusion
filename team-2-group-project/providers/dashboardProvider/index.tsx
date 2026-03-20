"use client";

import React, { useCallback, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { useAuthState } from "@/providers/authProvider";
import {
  getDashboardActivityTrends,
  getDashboardAnomalyTimeline,
  getDashboardRecentAlerts,
  getDashboardSeverityBreakdown,
  getDashboardSummary,
  getDashboardTopRisk,
} from "@/utils/datasentinel/dashboardService";
import {
  canAccessDataSentinelActivity,
  canAccessDataSentinelAlerts,
  canAccessDataSentinelInfrastructure,
} from "@/utils/auth/roles";
import { toArray } from "@/utils/helpers";
import {
  AiUnavailableError,
  generateDashboardAnalysis,
  IAiDashboardContext,
} from "@/utils/datasentinel/aiService";
import {
  DashboardActionContext,
  DashboardStateContext,
  DEFAULT_ACTIVITY_TRENDS,
  DEFAULT_ANOMALY_TIMELINE,
  DEFAULT_FILTERS,
  DEFAULT_SEVERITY_BREAKDOWN,
  DEFAULT_SUMMARY,
  DEFAULT_TOP_RISK,
  INITIAL_STATE,
} from "./context";
import {
  resetDashboardState,
  setDashboardAppliedFilters,
  setDashboardFilters,
  setDashboardState,
} from "./actions";
import { DashboardReducer } from "./reducer";

const resolveDashboardErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "The dashboard endpoints are not available on this backend yet.";
  }

  return error instanceof Error
    ? error.message
    : "Failed to load dashboard data.";
};

export const DashboardProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTenant, permissions, user } = useAuthState();
  const [state, dispatch] = useReducer(DashboardReducer, INITIAL_STATE);
  const hasTenantContext = Boolean(currentTenant?.tenantId);
  const canAccessActivity = canAccessDataSentinelActivity(permissions, user?.roles);
  const canAccessAlerts = canAccessDataSentinelAlerts(permissions);
  const canAccessInfrastructure = canAccessDataSentinelInfrastructure(permissions);

  useEffect(() => {
    if (!hasTenantContext) {
      dispatch(
        resetDashboardState({
          filters: DEFAULT_FILTERS,
          appliedFilters: DEFAULT_FILTERS,
          summary: DEFAULT_SUMMARY,
          activityTrends: DEFAULT_ACTIVITY_TRENDS,
          severityBreakdown: DEFAULT_SEVERITY_BREAKDOWN,
          anomalyTimeline: DEFAULT_ANOMALY_TIMELINE,
          topRisk: DEFAULT_TOP_RISK,
          recentAlerts: [],
          isLoading: false,
          isRefreshing: false,
          hasTenantContext: false,
          canAccessActivity,
          canAccessAlerts,
          canAccessInfrastructure,
        }),
      );
      return;
    }

    dispatch(
      setDashboardState({
        hasTenantContext: true,
        canAccessActivity,
        canAccessAlerts,
        canAccessInfrastructure,
      }),
    );
  }, [
    canAccessActivity,
    canAccessAlerts,
    canAccessInfrastructure,
    hasTenantContext,
  ]);

  const loadAiAnalysis = useCallback(
    async (
      summary: (typeof state)["summary"],
      anomalyTimeline: (typeof state)["anomalyTimeline"],
      topRisk: (typeof state)["topRisk"],
      recentAlerts: (typeof state)["recentAlerts"],
      windowDays: number,
    ) => {
      dispatch(setDashboardState({ isAiLoading: true, aiError: null }));
      try {
        const ctx: IAiDashboardContext = {
          windowDays,
          totalAlerts: summary.totalAlerts,
          criticalAlerts: summary.criticalAlerts,
          newAlerts: summary.newAlerts,
          totalFailedAccessAttempts: summary.totalFailedAccessAttempts,
          suspiciousWriteActivityCount: summary.suspiciousWriteActivityCount,
          highRiskUsersCount: summary.highRiskUsersCount,
          anomalyBucketCount: anomalyTimeline.items.filter(
            (b) => b.alertCount > 0 || b.suspiciousEventCount > 0,
          ).length,
          topRiskyUsers: topRisk.users.map((u) => ({
            actorUser: u.actorUser,
            riskScore: u.riskScore,
            alertCount: u.alertCount,
            highSeverityAlertCount: u.highSeverityAlertCount,
            failedLoginCount: u.failedLoginCount,
            outOfHoursEventCount: u.outOfHoursEventCount,
          })),
          recentAlerts: recentAlerts.map((a) => ({
            title: a.title,
            severity: a.severity,
            primaryActorUser: a.primaryActorUser,
          })),
        };
        const analysis = await generateDashboardAnalysis(ctx);
        dispatch(setDashboardState({ aiAnalysis: analysis, aiError: null }));
      } catch (error: unknown) {
        const message =
          error instanceof AiUnavailableError
            ? error.message
            : "AI analysis is temporarily unavailable.";
        dispatch(setDashboardState({ aiAnalysis: null, aiError: message }));
        console.error("[DashboardProvider] AI analysis failed:", error);
      } finally {
        dispatch(setDashboardState({ isAiLoading: false }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      dispatch(
        setDashboardState({
          isLoading: true,
          isRefreshing: false,
          errorMessage: null,
        }),
      );

      try {
        const [
          summary,
          activityTrends,
          severityBreakdown,
          anomalyTimeline,
          topRisk,
          recentAlerts,
        ] = await Promise.all([
          getDashboardSummary({
            windowDays: state.appliedFilters.windowDays,
          }),
          getDashboardActivityTrends({
            windowDays: state.appliedFilters.windowDays,
            bucketHours: state.appliedFilters.bucketHours,
          }),
          getDashboardSeverityBreakdown({
            windowDays: state.appliedFilters.windowDays,
          }),
          getDashboardAnomalyTimeline({
            windowDays: state.appliedFilters.windowDays,
            bucketHours: state.appliedFilters.bucketHours,
          }),
          getDashboardTopRisk({
            windowDays: state.appliedFilters.windowDays,
            maxUsers: state.appliedFilters.maxUsers,
            maxEntities: state.appliedFilters.maxEntities,
          }),
          getDashboardRecentAlerts(state.appliedFilters.windowDays),
        ]);

        if (cancelled) {
          return;
        }

        const alertItems = toArray(recentAlerts.items);
        dispatch(
          setDashboardState({
            summary,
            activityTrends,
            severityBreakdown,
            anomalyTimeline,
            topRisk,
            recentAlerts: alertItems,
            isLoading: false,
            isRefreshing: false,
            errorMessage: null,
          }),
        );
        void loadAiAnalysis(
          summary,
          anomalyTimeline,
          topRisk,
          alertItems,
          state.appliedFilters.windowDays,
        );
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        dispatch(
          setDashboardState({
            errorMessage: resolveDashboardErrorMessage(error),
            isLoading: false,
            isRefreshing: false,
          }),
        );
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [hasTenantContext, loadAiAnalysis, state.appliedFilters]);

  const setFilterValue = <K extends keyof typeof state.filters>(
    key: K,
    value: (typeof state.filters)[K],
  ) => {
    dispatch(
      setDashboardFilters({
        ...state.filters,
        [key]: value,
      }),
    );
  };

  const applyFilters = async () => {
    dispatch(setDashboardAppliedFilters(state.filters));
  };

  const resetFilters = async () => {
    dispatch(
      setDashboardState({
        filters: DEFAULT_FILTERS,
        appliedFilters: DEFAULT_FILTERS,
      }),
    );
  };

  const refresh = async () => {
    dispatch(
      setDashboardState({
        isRefreshing: true,
        appliedFilters: { ...state.appliedFilters },
        actionMessage: {
          type: "success",
          text: "Dashboard data refreshed.",
        },
      }),
    );
  };

  const clearMessages = () => {
    dispatch(
      setDashboardState({
        actionMessage: null,
        errorMessage: null,
      }),
    );
  };

  const retryAiAnalysis = async () => {
    await loadAiAnalysis(
      state.summary,
      state.anomalyTimeline,
      state.topRisk,
      state.recentAlerts,
      state.appliedFilters.windowDays,
    );
  };

  return (
    <DashboardStateContext.Provider
      value={{
        filters: state.filters,
        appliedFilters: state.appliedFilters,
        summary: state.summary,
        activityTrends: state.activityTrends,
        severityBreakdown: state.severityBreakdown,
        anomalyTimeline: state.anomalyTimeline,
        topRisk: state.topRisk,
        recentAlerts: state.recentAlerts,
        isLoading: state.isLoading,
        isRefreshing: state.isRefreshing,
        errorMessage: state.errorMessage,
        actionMessage: state.actionMessage,
        hasTenantContext,
        canAccessActivity,
        canAccessAlerts,
        canAccessInfrastructure,
        aiAnalysis: state.aiAnalysis,
        isAiLoading: state.isAiLoading,
        aiError: state.aiError,
      }}
    >
      <DashboardActionContext.Provider
        value={{
          setFilterValue,
          applyFilters,
          resetFilters,
          refresh,
          clearMessages,
          retryAiAnalysis,
        }}
      >
        {children}
      </DashboardActionContext.Provider>
    </DashboardStateContext.Provider>
  );
};

export const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (context === undefined) {
    throw new Error("useDashboardState must be used within a DashboardProvider");
  }

  return context;
};

export const useDashboardActions = () => {
  const context = useContext(DashboardActionContext);

  if (context === undefined) {
    throw new Error("useDashboardActions must be used within a DashboardProvider");
  }

  return context;
};
