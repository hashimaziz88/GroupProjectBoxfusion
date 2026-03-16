import { createAction } from "redux-actions";
import {
  IActivityEventListItem,
  IAlertRuleListItem,
  IDashboardOverview,
  IMonitoredDatabase,
  IMonitoredServer,
  IMonitoringIntakeResult,
  ISecurityAlertDetail,
  ISecurityAlertListItem,
} from "@/interfaces/datasentinel";
import { IDataSentinelStateContext } from "./context";

export enum DataSentinelActionEnums {
  dashboardPending = "DATASENTINEL_DASHBOARD_PENDING",
  dashboardSuccess = "DATASENTINEL_DASHBOARD_SUCCESS",
  dashboardError = "DATASENTINEL_DASHBOARD_ERROR",
  alertsPending = "DATASENTINEL_ALERTS_PENDING",
  alertsSuccess = "DATASENTINEL_ALERTS_SUCCESS",
  alertsError = "DATASENTINEL_ALERTS_ERROR",
  alertDetailPending = "DATASENTINEL_ALERT_DETAIL_PENDING",
  alertDetailSuccess = "DATASENTINEL_ALERT_DETAIL_SUCCESS",
  alertDetailError = "DATASENTINEL_ALERT_DETAIL_ERROR",
  rulesPending = "DATASENTINEL_RULES_PENDING",
  rulesSuccess = "DATASENTINEL_RULES_SUCCESS",
  rulesError = "DATASENTINEL_RULES_ERROR",
  activityPending = "DATASENTINEL_ACTIVITY_PENDING",
  activitySuccess = "DATASENTINEL_ACTIVITY_SUCCESS",
  activityError = "DATASENTINEL_ACTIVITY_ERROR",
  assetsPending = "DATASENTINEL_ASSETS_PENDING",
  assetsSuccess = "DATASENTINEL_ASSETS_SUCCESS",
  assetsError = "DATASENTINEL_ASSETS_ERROR",
  intakePending = "DATASENTINEL_INTAKE_PENDING",
  intakeSuccess = "DATASENTINEL_INTAKE_SUCCESS",
  intakeError = "DATASENTINEL_INTAKE_ERROR",
  clearError = "DATASENTINEL_CLEAR_ERROR",
}

export const dashboardPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.dashboardPending,
  () => ({
    isDashboardPending: true,
    errorMessage: null,
  }),
);

export const dashboardSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  IDashboardOverview
>(DataSentinelActionEnums.dashboardSuccess, (dashboardOverview) => ({
  isDashboardPending: false,
  dashboardOverview,
  errorMessage: null,
}));

export const dashboardError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.dashboardError, (message) => ({
  isDashboardPending: false,
  errorMessage: message ?? "Failed to load dashboard data.",
}));

export const alertsPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.alertsPending,
  () => ({
    isAlertsPending: true,
    errorMessage: null,
  }),
);

export const alertsSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  { alerts: ISecurityAlertListItem[]; totalCount: number }
>(DataSentinelActionEnums.alertsSuccess, ({ alerts, totalCount }) => ({
  isAlertsPending: false,
  alerts,
  alertsTotalCount: totalCount,
  errorMessage: null,
}));

export const alertsError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.alertsError, (message) => ({
  isAlertsPending: false,
  errorMessage: message ?? "Failed to load alert queue.",
}));

export const alertDetailPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.alertDetailPending,
  () => ({
    isAlertDetailPending: true,
    errorMessage: null,
  }),
);

export const alertDetailSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  ISecurityAlertDetail
>(DataSentinelActionEnums.alertDetailSuccess, (alertDetail) => ({
  isAlertDetailPending: false,
  alertDetail,
  errorMessage: null,
}));

export const alertDetailError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.alertDetailError, (message) => ({
  isAlertDetailPending: false,
  errorMessage: message ?? "Failed to load alert detail.",
}));

export const rulesPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.rulesPending,
  () => ({
    isRulesPending: true,
    errorMessage: null,
  }),
);

export const rulesSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  IAlertRuleListItem[]
>(DataSentinelActionEnums.rulesSuccess, (rules) => ({
  isRulesPending: false,
  rules,
  errorMessage: null,
}));

export const rulesError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.rulesError, (message) => ({
  isRulesPending: false,
  errorMessage: message ?? "Failed to load rule catalogue.",
}));

export const activityPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.activityPending,
  () => ({
    isActivityPending: true,
    errorMessage: null,
  }),
);

export const activitySuccess = createAction<
  Partial<IDataSentinelStateContext>,
  { activityEvents: IActivityEventListItem[]; totalCount: number }
>(DataSentinelActionEnums.activitySuccess, ({ activityEvents, totalCount }) => ({
  isActivityPending: false,
  activityEvents,
  activityTotalCount: totalCount,
  errorMessage: null,
}));

export const activityError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.activityError, (message) => ({
  isActivityPending: false,
  errorMessage: message ?? "Failed to load activity events.",
}));

export const assetsPending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.assetsPending,
  () => ({
    isAssetsPending: true,
    errorMessage: null,
  }),
);

export const assetsSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  { monitoredServers: IMonitoredServer[]; monitoredDatabases: IMonitoredDatabase[] }
>(DataSentinelActionEnums.assetsSuccess, ({ monitoredServers, monitoredDatabases }) => ({
  isAssetsPending: false,
  monitoredServers,
  monitoredDatabases,
  errorMessage: null,
}));

export const assetsError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.assetsError, (message) => ({
  isAssetsPending: false,
  errorMessage: message ?? "Failed to load monitored assets.",
}));

export const intakePending = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.intakePending,
  () => ({
    isIntakePending: true,
    errorMessage: null,
  }),
);

export const intakeSuccess = createAction<
  Partial<IDataSentinelStateContext>,
  IMonitoringIntakeResult
>(DataSentinelActionEnums.intakeSuccess, (intakeResult) => ({
  isIntakePending: false,
  intakeResult,
  errorMessage: null,
}));

export const intakeError = createAction<
  Partial<IDataSentinelStateContext>,
  string | undefined
>(DataSentinelActionEnums.intakeError, (message) => ({
  isIntakePending: false,
  errorMessage: message ?? "DataSentinel intake failed.",
}));

export const clearError = createAction<Partial<IDataSentinelStateContext>>(
  DataSentinelActionEnums.clearError,
  () => ({
    errorMessage: null,
  }),
);
