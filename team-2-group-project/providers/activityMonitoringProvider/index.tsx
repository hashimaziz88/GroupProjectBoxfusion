"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import axios from "axios";
import {
  ActivityTab,
  IActivityEventFilters,
  IActivityEventListItem,
  IActivityFilterDraft,
  IActivitySummary,
} from "@/interfaces/datasentinel/activity";
import { useAuthState } from "@/providers/authProvider";
import {
  getActivityEvents,
  getActivityFilterOptions,
  getActivitySummary,
} from "@/utils/datasentinel/activityService";
import { toArray } from "@/utils/helpers";
import {
  AiUnavailableError,
  generateActivityAnalysis,
} from "@/utils/datasentinel/aiService";
import {
  ActivityMonitoringActionContext,
  ActivityMonitoringStateContext,
  DEFAULT_FILTERS,
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_SUMMARY,
  INITIAL_STATE,
} from "./context";
import {
  setActivityMonitoringAppliedFilters,
  setActivityMonitoringFilters,
  setActivityMonitoringPagination,
  resetActivityMonitoringState,
  setActivityMonitoringState,
  setActivityMonitoringTab,
} from "./actions";
import { ActivityMonitoringReducer } from "./reducer";

const toUtcIsoString = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
};

const resolveActivityErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "The activity monitoring endpoints are not available on this backend yet.";
  }

  return error instanceof Error
    ? error.message
    : "Failed to load activity events.";
};

const mapTabToValue = (tab: ActivityTab) => {
  if (tab === "suspicious") {
    return 1;
  }

  if (tab === "failed") {
    return 2;
  }

  return 0;
};

export const ActivityMonitoringProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTenant } = useAuthState();
  const [state, dispatch] = useReducer(ActivityMonitoringReducer, INITIAL_STATE);
  const hasTenantContext = Boolean(currentTenant?.tenantId);

  const buildRequestFilters = useCallback(
    (): IActivityEventFilters => ({
      keyword: state.appliedFilters.keyword.trim() || undefined,
      serverId: state.appliedFilters.serverId,
      databaseId: state.appliedFilters.databaseId,
      actorUser: state.appliedFilters.actorUser,
      actorIp: state.appliedFilters.actorIp,
      operation: state.appliedFilters.operation,
      eventType: state.appliedFilters.eventType,
      severity: state.appliedFilters.severity,
      isSuccess:
        state.appliedFilters.status === "success"
          ? true
          : state.appliedFilters.status === "failure"
            ? false
            : undefined,
      startDate: toUtcIsoString(state.appliedFilters.startDate),
      endDate: toUtcIsoString(state.appliedFilters.endDate),
      tab: mapTabToValue(state.activeTab),
      sortDescending: state.appliedFilters.sortDescending,
      skipCount: (state.currentPage - 1) * state.pageSize,
      maxResultCount: state.pageSize,
    }),
    [state.activeTab, state.appliedFilters, state.currentPage, state.pageSize],
  );

  const loadAiAnalysis = useCallback(
    async (
      events: IActivityEventListItem[],
      summary: IActivitySummary,
      activeTab: ActivityTab,
      actorUser: string | undefined,
      operation: string | undefined,
    ) => {
      dispatch(setActivityMonitoringState({ isAiLoading: true, aiError: null }));
      try {
        const analysis = await generateActivityAnalysis({
          totalEvents: summary.totalEvents,
          readOps: summary.readOps,
          writeOps: summary.writeOps,
          authEvents: summary.authEvents,
          privilegedOps: summary.privilegedOps,
          suspiciousActivityCount: summary.suspiciousActivityCount,
          failedEventsCount: summary.failedEventsCount,
          activeTab,
          actorUser,
          operation,
          sampleEvents: events.slice(0, 20).map((e) => ({
            eventTime: e.eventTime,
            operation: e.operation,
            objectName: e.objectName,
            actorUser: e.actorUser,
            isSuccess: e.isSuccess,
            isOutOfHours: e.isOutOfHours,
            failureReason: e.failureReason,
          })),
        });
        dispatch(setActivityMonitoringState({ aiAnalysis: analysis, aiError: null }));
      } catch (error: unknown) {
        const message =
          error instanceof AiUnavailableError
            ? error.message
            : "AI analysis is temporarily unavailable.";
        dispatch(setActivityMonitoringState({ aiAnalysis: null, aiError: message }));
        console.error("[ActivityMonitoringProvider] AI analysis failed:", error);
      } finally {
        dispatch(setActivityMonitoringState({ isAiLoading: false }));
      }
    },
    [],
  );

  const loadFilterOptions = useCallback(async () => {
    const result = await getActivityFilterOptions();
    dispatch(
      setActivityMonitoringState({
        filterOptions: {
          databases: toArray(result.databases),
          servers: toArray(result.servers),
          users: toArray(result.users),
          ipAddresses: toArray(result.ipAddresses),
          operations: toArray(result.operations),
        },
      }),
    );
  }, []);

  const loadSummary = useCallback(async () => {
    dispatch(setActivityMonitoringState({ isSummaryLoading: true }));

    try {
      const result = await getActivitySummary();
      dispatch(setActivityMonitoringState({ summary: result }));
    } finally {
      dispatch(setActivityMonitoringState({ isSummaryLoading: false }));
    }
  }, []);

  const loadEvents = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        dispatch(setActivityMonitoringState({ isRefreshing: true }));
      } else {
        dispatch(setActivityMonitoringState({ isLoading: true }));
      }

      try {
        const result = await getActivityEvents(buildRequestFilters());
        const eventItems = toArray(result.items);
        dispatch(
          setActivityMonitoringState({
            events: eventItems,
            totalCount: result.totalCount ?? 0,
            errorMessage: null,
          }),
        );
        void loadAiAnalysis(
          eventItems,
          state.summary,
          state.activeTab,
          state.appliedFilters.actorUser,
          state.appliedFilters.operation,
        );
      } catch (error: unknown) {
        dispatch(
          setActivityMonitoringState({
            events: [],
            totalCount: 0,
            errorMessage: resolveActivityErrorMessage(error),
          }),
        );
      } finally {
        dispatch(
          setActivityMonitoringState({
            isLoading: false,
            isRefreshing: false,
          }),
        );
      }
    },
    [
      buildRequestFilters,
      loadAiAnalysis,
      state.activeTab,
      state.appliedFilters.actorUser,
      state.appliedFilters.operation,
      state.summary,
    ],
  );

  useEffect(() => {
    if (!hasTenantContext) {
      dispatch(
        resetActivityMonitoringState({
          filters: DEFAULT_FILTERS,
          appliedFilters: DEFAULT_FILTERS,
          filterOptions: DEFAULT_FILTER_OPTIONS,
          summary: DEFAULT_SUMMARY,
          isLoading: false,
          isRefreshing: false,
          isSummaryLoading: false,
          hasTenantContext: false,
        }),
      );
      return;
    }

    dispatch(setActivityMonitoringState({ hasTenantContext: true }));
    void Promise.all([loadFilterOptions(), loadSummary()]).catch((error: unknown) => {
      dispatch(
        setActivityMonitoringState({
          errorMessage: resolveActivityErrorMessage(error),
        }),
      );
    });
  }, [hasTenantContext, loadFilterOptions, loadSummary]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    void loadEvents();
  }, [hasTenantContext, loadEvents]);

  const setFilterValue = <K extends keyof IActivityFilterDraft>(
    key: K,
    value: IActivityFilterDraft[K],
  ) => {
    dispatch(
      setActivityMonitoringFilters({
        ...state.filters,
        [key]: value,
        ...(key === "serverId" ? { databaseId: undefined } : {}),
      }),
    );
  };

  const applyFilters = async () => {
    dispatch(setActivityMonitoringState({ currentPage: 1 }));
    dispatch(setActivityMonitoringAppliedFilters(state.filters));
  };

  const resetFilters = async () => {
    dispatch(
      setActivityMonitoringState({
        filters: DEFAULT_FILTERS,
        appliedFilters: DEFAULT_FILTERS,
        activeTab: "all",
        currentPage: 1,
        pageSize: 25,
      }),
    );
  };

  const refresh = async () => {
    await Promise.all([loadSummary(), loadEvents(true)]);
  };

  const setActiveTab = async (tab: ActivityTab) => {
    dispatch(setActivityMonitoringTab(tab));
  };

  const retryAiAnalysis = async () => {
    await loadAiAnalysis(
      state.events,
      state.summary,
      state.activeTab,
      state.appliedFilters.actorUser,
      state.appliedFilters.operation,
    );
  };

  const setPagination = async (page: number, nextPageSize: number) => {
    dispatch(
      setActivityMonitoringPagination({
        page,
        pageSize: nextPageSize,
      }),
    );
  };

  return (
    <ActivityMonitoringStateContext.Provider
      value={{
        filters: state.filters,
        appliedFilters: state.appliedFilters,
        events: state.events,
        filterOptions: state.filterOptions,
        summary: state.summary,
        activeTab: state.activeTab,
        isLoading: state.isLoading,
        isRefreshing: state.isRefreshing,
        isSummaryLoading: state.isSummaryLoading,
        errorMessage: state.errorMessage,
        totalCount: state.totalCount,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        hasTenantContext,
        aiAnalysis: state.aiAnalysis,
        isAiLoading: state.isAiLoading,
        aiError: state.aiError,
      }}
    >
      <ActivityMonitoringActionContext.Provider
        value={{
          setFilterValue,
          applyFilters,
          resetFilters,
          refresh,
          setActiveTab,
          setPagination,
          buildRequestFilters,
          retryAiAnalysis,
        }}
      >
        {children}
      </ActivityMonitoringActionContext.Provider>
    </ActivityMonitoringStateContext.Provider>
  );
};

export const useActivityMonitoringState = () => {
  const context = useContext(ActivityMonitoringStateContext);

  if (context === undefined) {
    throw new Error(
      "useActivityMonitoringState must be used within an ActivityMonitoringProvider",
    );
  }

  return context;
};

export const useActivityMonitoringActions = () => {
  const context = useContext(ActivityMonitoringActionContext);

  if (context === undefined) {
    throw new Error(
      "useActivityMonitoringActions must be used within an ActivityMonitoringProvider",
    );
  }

  return context;
};
