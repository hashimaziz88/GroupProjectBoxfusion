import { handleActions } from "redux-actions";
import { INITIAL_STATE, IMonitoringInfrastructureStateContext } from "./context";
import { MonitoringInfrastructureActionEnums } from "./actions";

export const MonitoringInfrastructureReducer = handleActions<
  IMonitoringInfrastructureStateContext,
  Partial<IMonitoringInfrastructureStateContext>
>(
  {
    [MonitoringInfrastructureActionEnums.setState]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [MonitoringInfrastructureActionEnums.setSelections]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [MonitoringInfrastructureActionEnums.setMessages]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [MonitoringInfrastructureActionEnums.resetState]: (_, action) => ({
      ...INITIAL_STATE,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);
