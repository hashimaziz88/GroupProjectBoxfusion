import { createAction } from "redux-actions";
import { ISecurityAlertFilterDraft } from "@/interfaces/datasentinel/alerts";
import { INITIAL_STATE, ISecurityAlertsStateContext } from "./context";

export enum SecurityAlertsActionEnums {
  setState = "SECURITY_ALERTS_SET_STATE",
  resetState = "SECURITY_ALERTS_RESET_STATE",
  setFilters = "SECURITY_ALERTS_SET_FILTERS",
  setAppliedFilters = "SECURITY_ALERTS_SET_APPLIED_FILTERS",
  setPagination = "SECURITY_ALERTS_SET_PAGINATION",
  setSelectedAlertIds = "SECURITY_ALERTS_SET_SELECTED_ALERT_IDS",
}

export const setSecurityAlertsState = createAction<
  Partial<ISecurityAlertsStateContext>,
  Partial<ISecurityAlertsStateContext>
>(SecurityAlertsActionEnums.setState, (payload) => payload);

export const resetSecurityAlertsState = createAction<
  ISecurityAlertsStateContext,
  Partial<ISecurityAlertsStateContext> | undefined
>(
  SecurityAlertsActionEnums.resetState,
  (payload) => ({
    ...INITIAL_STATE,
    ...payload,
  }),
);

export const setSecurityAlertsFilters = createAction<
  Partial<ISecurityAlertsStateContext>,
  ISecurityAlertFilterDraft
>(SecurityAlertsActionEnums.setFilters, (filters) => ({
  filters,
}));

export const setSecurityAlertsAppliedFilters = createAction<
  Partial<ISecurityAlertsStateContext>,
  ISecurityAlertFilterDraft
>(SecurityAlertsActionEnums.setAppliedFilters, (appliedFilters) => ({
  appliedFilters,
  currentPage: 1,
}));

export const setSecurityAlertsPagination = createAction<
  Partial<ISecurityAlertsStateContext>,
  { page: number; pageSize: number }
>(SecurityAlertsActionEnums.setPagination, ({ page, pageSize }) => ({
  currentPage: page,
  pageSize,
}));

export const setSecurityAlertSelectedIds = createAction<
  Partial<ISecurityAlertsStateContext>,
  string[]
>(SecurityAlertsActionEnums.setSelectedAlertIds, (selectedAlertIds) => ({
  selectedAlertIds,
}));
