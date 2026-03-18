import { createAction } from "redux-actions";
import { INITIAL_STATE, IMonitoringInfrastructureStateContext } from "./context";

export enum MonitoringInfrastructureActionEnums {
  setState = "MONITORING_INFRASTRUCTURE_SET_STATE",
  resetState = "MONITORING_INFRASTRUCTURE_RESET_STATE",
  setSelections = "MONITORING_INFRASTRUCTURE_SET_SELECTIONS",
  setMessages = "MONITORING_INFRASTRUCTURE_SET_MESSAGES",
}

export const setMonitoringInfrastructureState = createAction<
  Partial<IMonitoringInfrastructureStateContext>,
  Partial<IMonitoringInfrastructureStateContext>
>(MonitoringInfrastructureActionEnums.setState, (payload) => payload);

export const resetMonitoringInfrastructureState = createAction<
  IMonitoringInfrastructureStateContext,
  Partial<IMonitoringInfrastructureStateContext> | undefined
>(
  MonitoringInfrastructureActionEnums.resetState,
  (payload) => ({
    ...INITIAL_STATE,
    ...payload,
  }),
);

export const setMonitoringInfrastructureSelections = createAction<
  Partial<IMonitoringInfrastructureStateContext>,
  Partial<
    Pick<
    IMonitoringInfrastructureStateContext,
    "selectedServerId" | "selectedDatabaseId"
    >
  >
>(MonitoringInfrastructureActionEnums.setSelections, (payload) => payload);

export const setMonitoringInfrastructureMessages = createAction<
  Partial<IMonitoringInfrastructureStateContext>,
  Partial<
    Pick<
    IMonitoringInfrastructureStateContext,
    "errorMessage" | "actionMessage" | "bootstrapResult"
    >
  >
>(MonitoringInfrastructureActionEnums.setMessages, (payload) => payload);
