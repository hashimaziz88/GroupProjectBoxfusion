"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { PERMISSIONS } from "@/constants/auth/roles";
import {
  IBootstrapMonitoringDemoInput,
  ICreateMonitoredDatabaseInput,
  ICreateMonitoredServerInput,
  ICreateMonitoredTableInput,
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
} from "@/interfaces/datasentinel/monitoring";
import { useAuthState } from "@/providers/authProvider";
import { hasPermission } from "@/utils/auth/roles";
import {
  bootstrapMonitoringDemo,
  createMonitoredDatabase,
  createMonitoredServer,
  createMonitoredTable,
  getMonitoredDatabases,
  getMonitoredServers,
  getMonitoredTables,
} from "@/utils/datasentinel/monitoringService";
import { toArray } from "@/utils/helpers";
import {
  INITIAL_STATE,
  MonitoringInfrastructureActionContext,
  MonitoringInfrastructureStateContext,
} from "./context";
import {
  resetMonitoringInfrastructureState,
  setMonitoringInfrastructureMessages,
  setMonitoringInfrastructureSelections,
  setMonitoringInfrastructureState,
} from "./actions";
import { MonitoringInfrastructureReducer } from "./reducer";

const resolveErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The monitoring infrastructure request failed.";

const monitoredDatabasesFromServers = (servers: IMonitoredServerListItem[]) =>
  servers.flatMap((server) =>
    toArray(server.databases).map((database) => ({
      ...database,
      serverId: database.serverId ?? server.id,
    })),
  );

const monitoredTablesFromDatabases = (databases: IMonitoredDatabaseListItem[]) =>
  databases.flatMap((database) =>
    toArray(database.tables).map((table) => ({
      ...table,
      databaseId: table.databaseId ?? database.id,
    })),
  );

export const MonitoringInfrastructureProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTenant, permissions } = useAuthState();
  const [state, dispatch] = useReducer(
    MonitoringInfrastructureReducer,
    INITIAL_STATE,
  );

  const hasTenantContext = Boolean(currentTenant?.tenantId);
  const canManageInfrastructure = hasPermission(
    permissions,
    PERMISSIONS.dataSentinelInfrastructureManage,
  );

  const allDatabases = useMemo(
    () => monitoredDatabasesFromServers(state.servers),
    [state.servers],
  );
  const allTables = useMemo(
    () => monitoredTablesFromDatabases(allDatabases),
    [allDatabases],
  );
  const availableDatabases = useMemo(
    () =>
      state.selectedServerId
        ? allDatabases.filter((database) => database.serverId === state.selectedServerId)
        : allDatabases,
    [allDatabases, state.selectedServerId],
  );

  const clearMessages = () => {
    dispatch(
      setMonitoringInfrastructureMessages({
        errorMessage: null,
        actionMessage: null,
        bootstrapResult: state.bootstrapResult,
      }),
    );
  };

  const setSelectedServerId = (serverId?: string) => {
    dispatch(
      setMonitoringInfrastructureSelections({
        selectedServerId: serverId,
        selectedDatabaseId: undefined,
      }),
    );
  };

  const setSelectedDatabaseId = (databaseId?: string) => {
    dispatch(
      setMonitoringInfrastructureSelections({
        selectedDatabaseId: databaseId,
        selectedServerId: state.selectedServerId,
      }),
    );
  };

  const loadInfrastructure = useCallback(async (refreshing = false) => {
    if (refreshing) {
      dispatch(setMonitoringInfrastructureState({ isRefreshing: true }));
    } else {
      dispatch(setMonitoringInfrastructureState({ isLoading: true }));
    }

    try {
      const result = await getMonitoredServers();
      const items = toArray(result.items);

      dispatch(
        setMonitoringInfrastructureState({
          servers: items,
          errorMessage: null,
        }),
      );

      if (state.selectedServerId && !items.some((server) => server.id === state.selectedServerId)) {
        dispatch(
          setMonitoringInfrastructureState({
            selectedServerId: undefined,
            selectedDatabaseId: undefined,
          }),
        );
      } else if (
        state.selectedDatabaseId &&
        !monitoredDatabasesFromServers(items).some(
          (database) => database.id === state.selectedDatabaseId,
        )
      ) {
        dispatch(
          setMonitoringInfrastructureState({
            selectedDatabaseId: undefined,
          }),
        );
      }
    } catch (error: unknown) {
      dispatch(
        setMonitoringInfrastructureState({
          servers: [],
          databaseItems: [],
          tableItems: [],
          errorMessage: resolveErrorMessage(error),
        }),
      );
    } finally {
      dispatch(
        setMonitoringInfrastructureState({
          isLoading: false,
          isRefreshing: false,
        }),
      );
    }
  }, [state.selectedDatabaseId, state.selectedServerId]);

  const loadScopedDatabases = useCallback(async (serverId?: string) => {
    if (!serverId) {
      dispatch(
        setMonitoringInfrastructureState({
          databaseItems: allDatabases,
        }),
      );
      return;
    }

    dispatch(setMonitoringInfrastructureState({ isDatabaseLoading: true }));

    try {
      const result = await getMonitoredDatabases(serverId);
      dispatch(
        setMonitoringInfrastructureState({
          databaseItems: toArray(result.items),
          errorMessage: null,
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setMonitoringInfrastructureState({
          databaseItems: [],
          errorMessage: resolveErrorMessage(error),
        }),
      );
    } finally {
      dispatch(setMonitoringInfrastructureState({ isDatabaseLoading: false }));
    }
  }, [allDatabases]);

  const loadScopedTables = useCallback(async (databaseId?: string) => {
    if (!databaseId) {
      if (state.selectedServerId) {
        const scopedDatabaseIds = allDatabases
          .filter((database) => database.serverId === state.selectedServerId)
          .map((database) => database.id);

        dispatch(
          setMonitoringInfrastructureState({
            tableItems: allTables.filter((table) =>
              scopedDatabaseIds.includes(table.databaseId),
            ),
          }),
        );
      } else {
        dispatch(
          setMonitoringInfrastructureState({
            tableItems: allTables,
          }),
        );
      }
      return;
    }

    dispatch(setMonitoringInfrastructureState({ isTableLoading: true }));

    try {
      const result = await getMonitoredTables(databaseId);
      dispatch(
        setMonitoringInfrastructureState({
          tableItems: toArray(result.items),
          errorMessage: null,
        }),
      );
    } catch (error: unknown) {
      dispatch(
        setMonitoringInfrastructureState({
          tableItems: [],
          errorMessage: resolveErrorMessage(error),
        }),
      );
    } finally {
      dispatch(setMonitoringInfrastructureState({ isTableLoading: false }));
    }
  }, [allDatabases, allTables, state.selectedServerId]);

  useEffect(() => {
    if (!hasTenantContext) {
      dispatch(
        resetMonitoringInfrastructureState({
          isLoading: false,
          isRefreshing: false,
          isDatabaseLoading: false,
          isTableLoading: false,
        }),
      );
      return;
    }

    dispatch(
      setMonitoringInfrastructureState({
        hasTenantContext,
        canManageInfrastructure,
      }),
    );
    void loadInfrastructure();
  }, [canManageInfrastructure, hasTenantContext, loadInfrastructure]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    if (!state.selectedServerId) {
      dispatch(
        setMonitoringInfrastructureState({
          databaseItems: allDatabases,
        }),
      );
      return;
    }

    void loadScopedDatabases(state.selectedServerId);
  }, [allDatabases, hasTenantContext, loadScopedDatabases, state.selectedServerId]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    if (!state.selectedDatabaseId) {
      if (state.selectedServerId) {
        const scopedDatabases = allDatabases.filter(
          (database) => database.serverId === state.selectedServerId,
        );
        dispatch(
          setMonitoringInfrastructureState({
            tableItems: monitoredTablesFromDatabases(scopedDatabases),
          }),
        );
        return;
      }

      dispatch(
        setMonitoringInfrastructureState({
          tableItems: monitoredTablesFromDatabases(allDatabases),
        }),
      );
      return;
    }

    void loadScopedTables(state.selectedDatabaseId);
  }, [
    allDatabases,
    hasTenantContext,
    loadScopedTables,
    state.selectedDatabaseId,
    state.selectedServerId,
  ]);

  const performMutation = async (
    mutation: () => Promise<void>,
    successText: string,
    ) => {
    if (!canManageInfrastructure) {
      dispatch(
        setMonitoringInfrastructureMessages({
          actionMessage: {
            type: "error",
            text: "You do not have permission to modify monitored infrastructure.",
          },
          errorMessage: state.errorMessage,
          bootstrapResult: state.bootstrapResult,
        }),
      );
      return false;
    }

    try {
      await mutation();
      dispatch(
        setMonitoringInfrastructureMessages({
          actionMessage: {
            type: "success",
            text: successText,
          },
          errorMessage: null,
          bootstrapResult: state.bootstrapResult,
        }),
      );
      await loadInfrastructure(true);
      return true;
    } catch (error: unknown) {
      dispatch(
        setMonitoringInfrastructureMessages({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
          errorMessage: state.errorMessage,
          bootstrapResult: state.bootstrapResult,
        }),
      );
      return false;
    }
  };

  const createServerAction = (input: ICreateMonitoredServerInput) =>
    performMutation(
      async () => {
        await createMonitoredServer(input);
      },
      "Monitored server created successfully.",
    );

  const createDatabaseAction = (input: ICreateMonitoredDatabaseInput) =>
    performMutation(
      async () => {
        await createMonitoredDatabase(input);
      },
      "Monitored database created successfully.",
    );

  const createTableAction = (input: ICreateMonitoredTableInput) =>
    performMutation(
      async () => {
        await createMonitoredTable(input);
      },
      "Monitored table created successfully.",
    );

  const bootstrapDemoAction = async (input: IBootstrapMonitoringDemoInput) => {
    if (!canManageInfrastructure) {
      dispatch(
        setMonitoringInfrastructureMessages({
          actionMessage: {
            type: "error",
            text: "You do not have permission to bootstrap monitored infrastructure.",
          },
          errorMessage: state.errorMessage,
          bootstrapResult: state.bootstrapResult,
        }),
      );
      return false;
    }

    try {
      const result = await bootstrapMonitoringDemo(input);
      dispatch(
        setMonitoringInfrastructureMessages({
          bootstrapResult: result,
          actionMessage: {
            type: "success",
            text: "Demo monitoring infrastructure bootstrap completed.",
          },
          errorMessage: null,
        }),
      );
      await loadInfrastructure(true);
      return true;
    } catch (error: unknown) {
      dispatch(
        setMonitoringInfrastructureMessages({
          actionMessage: {
            type: "error",
            text: resolveErrorMessage(error),
          },
          errorMessage: state.errorMessage,
          bootstrapResult: state.bootstrapResult,
        }),
      );
      return false;
    }
  };

  return (
    <MonitoringInfrastructureStateContext.Provider
      value={{
        ...state,
        servers: state.servers,
        databaseItems: state.databaseItems,
        tableItems: state.tableItems,
        allDatabases,
        allTables,
        availableDatabases,
        hasTenantContext,
        canManageInfrastructure,
      }}
    >
      <MonitoringInfrastructureActionContext.Provider
        value={{
          setSelectedServerId,
          setSelectedDatabaseId,
          clearMessages,
          refreshInfrastructure: async () => loadInfrastructure(true),
          createServer: createServerAction,
          createDatabase: createDatabaseAction,
          createTable: createTableAction,
          bootstrapDemo: bootstrapDemoAction,
        }}
      >
        {children}
      </MonitoringInfrastructureActionContext.Provider>
    </MonitoringInfrastructureStateContext.Provider>
  );
};

export const useMonitoringInfrastructureState = () => {
  const context = useContext(MonitoringInfrastructureStateContext);

  if (context === undefined) {
    throw new Error(
      "useMonitoringInfrastructureState must be used within a MonitoringInfrastructureProvider",
    );
  }

  return context;
};

export const useMonitoringInfrastructureActions = () => {
  const context = useContext(MonitoringInfrastructureActionContext);

  if (context === undefined) {
    throw new Error(
      "useMonitoringInfrastructureActions must be used within a MonitoringInfrastructureProvider",
    );
  }

  return context;
};
