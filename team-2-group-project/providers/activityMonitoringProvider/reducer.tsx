import { handleActions } from "redux-actions";
import { IActivityMonitoringStateContext, INITIAL_STATE } from "./context";
import { ActivityMonitoringActionEnums } from "./actions";

export const ActivityMonitoringReducer = handleActions<
  IActivityMonitoringStateContext,
  Partial<IActivityMonitoringStateContext>
>(
  {
    [ActivityMonitoringActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityMonitoringActionEnums.setFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityMonitoringActionEnums.setAppliedFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityMonitoringActionEnums.setActiveTab]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityMonitoringActionEnums.setPagination]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ActivityMonitoringActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
