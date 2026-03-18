"use client";

import React, {
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { PERMISSIONS } from "@/constants/auth/roles";
import {
  IBootstrapMonitoringDemoInput,
  IBootstrapMonitoringDemoResult,
  ICreateMonitoredDatabaseInput,
  ICreateMonitoredServerInput,
  ICreateMonitoredTableInput,
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
  IMonitoredTableListItem,
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
  IMonitoringActionMessage,
  MonitoringInfrastructureActionContext,
  MonitoringInfrastructureStateContext,
} from "./context";

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
  const [servers, setServers] = useState<IMonitoredServerListItem[]>(
    INITIAL_STATE.servers,
  );
  const [databaseItems, setDatabaseItems] = useState<
    IMonitoredDatabaseListItem[]
  >(INITIAL_STATE.databaseItems);
  const [tableItems, setTableItems] = useState<IMonitoredTableListItem[]>(
    INITIAL_STATE.tableItems,
  );
  const [selectedServerId, setSelectedServerIdState] = useState<
    string | undefined
  >(INITIAL_STATE.selectedServerId);
  const [selectedDatabaseId, setSelectedDatabaseIdState] = useState<
    string | undefined
  >(INITIAL_STATE.selectedDatabaseId);
  const [isLoading, setIsLoading] = useState(INITIAL_STATE.isLoading);
  const [isRefreshing, setIsRefreshing] = useState(INITIAL_STATE.isRefreshing);
  const [isDatabaseLoading, setIsDatabaseLoading] = useState(
    INITIAL_STATE.isDatabaseLoading,
  );
  const [isTableLoading, setIsTableLoading] = useState(
    INITIAL_STATE.isTableLoading,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    INITIAL_STATE.errorMessage,
  );
  const [actionMessage, setActionMessage] =
    useState<IMonitoringActionMessage | null>(INITIAL_STATE.actionMessage);
  const [bootstrapResult, setBootstrapResult] =
    useState<IBootstrapMonitoringDemoResult | null>(INITIAL_STATE.bootstrapResult);

  const hasTenantContext = Boolean(currentTenant?.tenantId);
  const canManageInfrastructure = hasPermission(
    permissions,
    PERMISSIONS.dataSentinelInfrastructureManage,
  );

  const allDatabases = useMemo(
    () => monitoredDatabasesFromServers(servers),
    [servers],
  );
  const allTables = useMemo(
    () => monitoredTablesFromDatabases(allDatabases),
    [allDatabases],
  );
  const availableDatabases = useMemo(
    () =>
      selectedServerId
        ? allDatabases.filter((database) => database.serverId === selectedServerId)
        : allDatabases,
    [allDatabases, selectedServerId],
  );

  const clearMessages = () => {
    setErrorMessage(null);
    setActionMessage(null);
  };

  const setSelectedServerId = (serverId?: string) => {
    setSelectedServerIdState(serverId);
    setSelectedDatabaseIdState(undefined);
  };

  const setSelectedDatabaseId = (databaseId?: string) => {
    setSelectedDatabaseIdState(databaseId);
  };

  const loadInfrastructure = useEffectEvent(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await getMonitoredServers();
      const items = toArray(result.items);

      setServers(items);
      setErrorMessage(null);

      if (selectedServerId && !items.some((server) => server.id === selectedServerId)) {
        setSelectedServerIdState(undefined);
        setSelectedDatabaseIdState(undefined);
      } else if (
        selectedDatabaseId &&
        !monitoredDatabasesFromServers(items).some(
          (database) => database.id === selectedDatabaseId,
        )
      ) {
        setSelectedDatabaseIdState(undefined);
      }
    } catch (error: unknown) {
      setServers([]);
      setDatabaseItems([]);
      setTableItems([]);
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  });

  const loadScopedDatabases = useEffectEvent(async (serverId?: string) => {
    if (!serverId) {
      setDatabaseItems(allDatabases);
      return;
    }

    setIsDatabaseLoading(true);

    try {
      const result = await getMonitoredDatabases(serverId);
      setDatabaseItems(toArray(result.items));
      setErrorMessage(null);
    } catch (error: unknown) {
      setDatabaseItems([]);
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsDatabaseLoading(false);
    }
  });

  const loadScopedTables = useEffectEvent(async (databaseId?: string) => {
    if (!databaseId) {
      if (selectedServerId) {
        const scopedDatabaseIds = allDatabases
          .filter((database) => database.serverId === selectedServerId)
          .map((database) => database.id);

        setTableItems(
          allTables.filter((table) => scopedDatabaseIds.includes(table.databaseId)),
        );
      } else {
        setTableItems(allTables);
      }
      return;
    }

    setIsTableLoading(true);

    try {
      const result = await getMonitoredTables(databaseId);
      setTableItems(toArray(result.items));
      setErrorMessage(null);
    } catch (error: unknown) {
      setTableItems([]);
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsTableLoading(false);
    }
  });

  useEffect(() => {
    if (!hasTenantContext) {
      setServers([]);
      setDatabaseItems([]);
      setTableItems([]);
      setSelectedServerIdState(undefined);
      setSelectedDatabaseIdState(undefined);
      setBootstrapResult(null);
      setErrorMessage(null);
      setActionMessage(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsDatabaseLoading(false);
      setIsTableLoading(false);
      return;
    }

    void loadInfrastructure();
  }, [hasTenantContext]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    if (!selectedServerId) {
      setDatabaseItems(allDatabases);
      return;
    }

    void loadScopedDatabases(selectedServerId);
  }, [allDatabases, hasTenantContext, selectedServerId]);

  useEffect(() => {
    if (!hasTenantContext) {
      return;
    }

    if (!selectedDatabaseId) {
      if (selectedServerId) {
        const scopedDatabases = allDatabases.filter(
          (database) => database.serverId === selectedServerId,
        );
        setTableItems(monitoredTablesFromDatabases(scopedDatabases));
        return;
      }

      setTableItems(monitoredTablesFromDatabases(allDatabases));
      return;
    }

    void loadScopedTables(selectedDatabaseId);
  }, [allDatabases, hasTenantContext, selectedDatabaseId, selectedServerId]);

  const performMutation = async (
    mutation: () => Promise<void>,
    successText: string,
  ) => {
    try {
      await mutation();
      setActionMessage({
        type: "success",
        text: successText,
      });
      setErrorMessage(null);
      await loadInfrastructure(true);
      return true;
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveErrorMessage(error),
      });
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
    try {
      const result = await bootstrapMonitoringDemo(input);
      setBootstrapResult(result);
      setActionMessage({
        type: "success",
        text: "Demo monitoring infrastructure bootstrap completed.",
      });
      setErrorMessage(null);
      await loadInfrastructure(true);
      return true;
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveErrorMessage(error),
      });
      return false;
    }
  };

  return (
    <MonitoringInfrastructureStateContext.Provider
      value={{
        servers,
        databaseItems,
        tableItems,
        allDatabases,
        allTables,
        availableDatabases,
        selectedServerId,
        selectedDatabaseId,
        isLoading,
        isRefreshing,
        isDatabaseLoading,
        isTableLoading,
        hasTenantContext,
        canManageInfrastructure,
        errorMessage,
        actionMessage,
        bootstrapResult,
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
