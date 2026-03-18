import { createAction } from "redux-actions";
import { IActivityMonitoringStateContext, INITIAL_STATE } from "./context";
import { ActivityTab, IActivityFilterDraft } from "@/interfaces/datasentinel/activity";

export enum ActivityMonitoringActionEnums {
  setState = "ACTIVITY_MONITORING_SET_STATE",
  resetState = "ACTIVITY_MONITORING_RESET_STATE",
  setFilters = "ACTIVITY_MONITORING_SET_FILTERS",
  setAppliedFilters = "ACTIVITY_MONITORING_SET_APPLIED_FILTERS",
  setActiveTab = "ACTIVITY_MONITORING_SET_ACTIVE_TAB",
  setPagination = "ACTIVITY_MONITORING_SET_PAGINATION",
}

export const setActivityMonitoringState = createAction<
  Partial<IActivityMonitoringStateContext>,
  Partial<IActivityMonitoringStateContext>
>(ActivityMonitoringActionEnums.setState, (payload) => payload);

export const resetActivityMonitoringState = createAction<
  IActivityMonitoringStateContext,
  Partial<IActivityMonitoringStateContext> | undefined
>(
  ActivityMonitoringActionEnums.resetState,
  (payload) => ({
    ...INITIAL_STATE,
    ...payload,
  }),
);

export const setActivityMonitoringFilters = createAction<
  Partial<IActivityMonitoringStateContext>,
  IActivityFilterDraft
>(ActivityMonitoringActionEnums.setFilters, (filters) => ({
  filters,
}));

export const setActivityMonitoringAppliedFilters = createAction<
  Partial<IActivityMonitoringStateContext>,
  IActivityFilterDraft
>(ActivityMonitoringActionEnums.setAppliedFilters, (appliedFilters) => ({
  appliedFilters,
}));

export const setActivityMonitoringTab = createAction<
  Partial<IActivityMonitoringStateContext>,
  ActivityTab
>(ActivityMonitoringActionEnums.setActiveTab, (activeTab) => ({
  activeTab,
  currentPage: 1,
}));

export const setActivityMonitoringPagination = createAction<
  Partial<IActivityMonitoringStateContext>,
  { page: number; pageSize: number }
>(ActivityMonitoringActionEnums.setPagination, ({ page, pageSize }) => ({
  currentPage: page,
  pageSize,
}));
