"use client";

import React, { useContext, useReducer } from "react";
import {
  addAlertNote,
  generateDemoData,
  getActivityEvents,
  getAlertDetail,
  getAlertRules,
  getAlerts,
  getDashboardOverview,
  getMonitoredDatabases,
  getMonitoredServers,
  importActivityEvents,
  updateAlertRule,
  updateAlertStatus,
} from "@/utils/datasentinel/service";
import { ICreateIncidentNoteInput, IGetDashboardOverviewInput } from "@/interfaces/datasentinel";
import { toArray } from "@/utils/helpers";
import {
  alertDetailError,
  alertDetailPending,
  alertDetailSuccess,
  alertsError,
  alertsPending,
  alertsSuccess,
  assetsError,
  assetsPending,
  assetsSuccess,
  clearError,
  dashboardError,
  dashboardPending,
  dashboardSuccess,
  activityError,
  activityPending,
  activitySuccess,
  intakeError,
  intakePending,
  intakeSuccess,
  rulesError,
  rulesPending,
  rulesSuccess,
} from "./actions";
import {
  DataSentinelActionContext,
  DataSentinelStateContext,
  INITIAL_STATE,
} from "./context";
import { DataSentinelReducer } from "./reducer";

export const DataSentinelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(DataSentinelReducer, INITIAL_STATE);

  const loadDashboard = async (input?: IGetDashboardOverviewInput) => {
    const resolvedInput: IGetDashboardOverviewInput = {
      windowDays: input?.windowDays ?? 7,
    };

    dispatch(dashboardPending());
    return getDashboardOverview(resolvedInput)
      .then((dashboardOverview) => {
        dispatch(dashboardSuccess(dashboardOverview));
      })
      .catch((error: unknown) => {
        dispatch(
          dashboardError(
            error instanceof Error ? error.message : "Failed to load dashboard data.",
          ),
        );
      });
  };

  const loadAlerts = async (input: Parameters<typeof getAlerts>[0]) => {
    dispatch(alertsPending());
    return getAlerts(input)
      .then((result) => {
        dispatch(
          alertsSuccess({
            alerts: toArray(result.items),
            totalCount: result.totalCount ?? 0,
          }),
        );
      })
      .catch((error: unknown) => {
        dispatch(
          alertsError(
            error instanceof Error ? error.message : "Failed to load alert queue.",
          ),
        );
      });
  };

  const loadAlertDetail = async (alertId: number) => {
    dispatch(alertDetailPending());
    return getAlertDetail(alertId)
      .then((alertDetail) => {
        dispatch(alertDetailSuccess(alertDetail));
      })
      .catch((error: unknown) => {
        dispatch(
          alertDetailError(
            error instanceof Error ? error.message : "Failed to load alert detail.",
          ),
        );
      });
  };

  const changeAlertStatus = async (input: Parameters<typeof updateAlertStatus>[0]) => {
    dispatch(alertDetailPending());
    return updateAlertStatus(input)
      .then((alertDetail) => {
        dispatch(alertDetailSuccess(alertDetail));
        return alertDetail;
      })
      .catch((error: unknown) => {
        dispatch(
          alertDetailError(
            error instanceof Error ? error.message : "Failed to update alert status.",
          ),
        );
        return null;
      });
  };

  const createAlertNote = async (input: ICreateIncidentNoteInput) => {
    dispatch(alertDetailPending());
    return addAlertNote(input)
      .then(async () => {
        const detail = await getAlertDetail(input.alertId);
        dispatch(alertDetailSuccess(detail));
      })
      .catch((error: unknown) => {
        dispatch(
          alertDetailError(
            error instanceof Error ? error.message : "Failed to add alert note.",
          ),
        );
      });
  };

  const loadRules = async () => {
    dispatch(rulesPending());
    return getAlertRules()
      .then((result) => {
        dispatch(rulesSuccess(toArray(result.items)));
      })
      .catch((error: unknown) => {
        dispatch(
          rulesError(
            error instanceof Error ? error.message : "Failed to load alert rules.",
          ),
        );
      });
  };

  const saveRule = async (input: Parameters<typeof updateAlertRule>[0]) => {
    dispatch(rulesPending());
    return updateAlertRule(input)
      .then((rule) => {
        const nextRules = toArray(state.rules).map((currentRule) =>
          currentRule.id === rule.id ? rule : currentRule,
        );
        dispatch(rulesSuccess(nextRules));
        return rule;
      })
      .catch((error: unknown) => {
        dispatch(
          rulesError(
            error instanceof Error ? error.message : "Failed to save alert rule.",
          ),
        );
        return null;
      });
  };

  const loadActivityEvents = async (input: Parameters<typeof getActivityEvents>[0]) => {
    dispatch(activityPending());
    return getActivityEvents(input)
      .then((result) => {
        dispatch(
          activitySuccess({
            activityEvents: toArray(result.items),
            totalCount: result.totalCount ?? 0,
          }),
        );
      })
      .catch((error: unknown) => {
        dispatch(
          activityError(
            error instanceof Error ? error.message : "Failed to load activity events.",
          ),
        );
      });
  };

  const loadAssets = async () => {
    dispatch(assetsPending());
    return Promise.all([getMonitoredServers(), getMonitoredDatabases()])
      .then(([serversResult, databasesResult]) => {
        dispatch(
          assetsSuccess({
            monitoredServers: toArray(serversResult.items),
            monitoredDatabases: toArray(databasesResult.items),
          }),
        );
      })
      .catch((error: unknown) => {
        dispatch(
          assetsError(
            error instanceof Error ? error.message : "Failed to load monitored assets.",
          ),
        );
      });
  };

  const runDemoGeneration = async (input: Parameters<typeof generateDemoData>[0]) => {
    dispatch(intakePending());
    return generateDemoData(input)
      .then((intakeResult) => {
        dispatch(intakeSuccess(intakeResult));
        return intakeResult;
      })
      .catch((error: unknown) => {
        dispatch(
          intakeError(
            error instanceof Error ? error.message : "Failed to generate demo data.",
          ),
        );
        return null;
      });
  };

  const runActivityImport = async (input: Parameters<typeof importActivityEvents>[0]) => {
    dispatch(intakePending());
    return importActivityEvents(input)
      .then((intakeResult) => {
        dispatch(intakeSuccess(intakeResult));
        return intakeResult;
      })
      .catch((error: unknown) => {
        dispatch(
          intakeError(
            error instanceof Error ? error.message : "Failed to import activity events.",
          ),
        );
        return null;
      });
  };

  const clearDataSentinelError = () => {
    dispatch(clearError());
  };

  return (
    <DataSentinelStateContext.Provider value={state}>
      <DataSentinelActionContext.Provider
        value={{
          loadDashboard,
          loadAlerts,
          loadAlertDetail,
          changeAlertStatus,
          createAlertNote,
          loadRules,
          saveRule,
          loadActivityEvents,
          loadAssets,
          runDemoGeneration,
          runActivityImport,
          clearDataSentinelError,
        }}
      >
        {children}
      </DataSentinelActionContext.Provider>
    </DataSentinelStateContext.Provider>
  );
};

export const useDataSentinelState = () => {
  const context = useContext(DataSentinelStateContext);

  if (context === undefined) {
    throw new Error("useDataSentinelState must be used within a DataSentinelProvider");
  }

  return context;
};

export const useDataSentinelActions = () => {
  const context = useContext(DataSentinelActionContext);

  if (context === undefined) {
    throw new Error("useDataSentinelActions must be used within a DataSentinelProvider");
  }

  return context;
};
