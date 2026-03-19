import { createAction } from "redux-actions";
import { IDashboardFilterDraft } from "@/interfaces/datasentinel/dashboard";
import { IDashboardStateContext, INITIAL_STATE } from "./context";

export enum DashboardActionEnums {
  setState = "DASHBOARD_SET_STATE",
  resetState = "DASHBOARD_RESET_STATE",
  setFilters = "DASHBOARD_SET_FILTERS",
  setAppliedFilters = "DASHBOARD_SET_APPLIED_FILTERS",
}

export const setDashboardState = createAction<
  Partial<IDashboardStateContext>,
  Partial<IDashboardStateContext>
>(DashboardActionEnums.setState, (payload) => payload);

export const resetDashboardState = createAction<
  IDashboardStateContext,
  Partial<IDashboardStateContext> | undefined
>(
  DashboardActionEnums.resetState,
  (payload) => ({
    ...INITIAL_STATE,
    ...payload,
  }),
);

export const setDashboardFilters = createAction<
  Partial<IDashboardStateContext>,
  IDashboardFilterDraft
>(DashboardActionEnums.setFilters, (filters) => ({
  filters,
}));

export const setDashboardAppliedFilters = createAction<
  Partial<IDashboardStateContext>,
  IDashboardFilterDraft
>(DashboardActionEnums.setAppliedFilters, (appliedFilters) => ({
  appliedFilters,
}));
