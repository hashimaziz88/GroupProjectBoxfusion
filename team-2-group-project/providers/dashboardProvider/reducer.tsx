import { handleActions } from "redux-actions";
import { DashboardActionEnums } from "./actions";
import { IDashboardStateContext, INITIAL_STATE } from "./context";

export const DashboardReducer = handleActions<
  IDashboardStateContext,
  Partial<IDashboardStateContext>
>(
  {
    [DashboardActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DashboardActionEnums.setFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DashboardActionEnums.setAppliedFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DashboardActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
