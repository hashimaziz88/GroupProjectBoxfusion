import { handleActions } from "redux-actions";
import { INITIAL_STATE, IDataSentinelStateContext } from "./context";
import { DataSentinelActionEnums } from "./actions";

export const DataSentinelReducer = handleActions<
  IDataSentinelStateContext,
  Partial<IDataSentinelStateContext>
>(
  {
    [DataSentinelActionEnums.dashboardPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.dashboardSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.dashboardError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertDetailPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertDetailSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.alertDetailError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.rulesPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.rulesSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.rulesError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.activityPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.activitySuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.activityError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.assetsPending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.assetsSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.assetsError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.intakePending]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.intakeSuccess]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.intakeError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [DataSentinelActionEnums.clearError]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
