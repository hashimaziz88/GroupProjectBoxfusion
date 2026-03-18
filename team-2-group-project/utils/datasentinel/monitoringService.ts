import { axiosInstance } from "@/utils/axiosInstance";
import { unwrapAbpResponse } from "@/utils/abp";
import { IAbpResponse } from "@/interfaces/abp";
import {
  IBootstrapMonitoringDemoInput,
  IBootstrapMonitoringDemoResult,
  ICreateMonitoredDatabaseInput,
  ICreateMonitoredServerInput,
  ICreateMonitoredTableInput,
  IListResult,
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
  IMonitoredTableListItem,
} from "@/interfaces/datasentinel/monitoring";

export const getMonitoredServers = async () => {
  const response = await axiosInstance().get<
    IAbpResponse<IListResult<IMonitoredServerListItem>>
  >("/api/services/app/MonitoringInfrastructure/GetMonitoredServers");

  return unwrapAbpResponse(response.data);
};

export const getMonitoredDatabases = async (serverId?: string) => {
  const response = await axiosInstance().get<
    IAbpResponse<IListResult<IMonitoredDatabaseListItem>>
  >("/api/services/app/MonitoringInfrastructure/GetMonitoredDatabases", {
    params: serverId ? { serverId } : undefined,
  });

  return unwrapAbpResponse(response.data);
};

export const getMonitoredTables = async (databaseId: string) => {
  const response = await axiosInstance().get<
    IAbpResponse<IListResult<IMonitoredTableListItem>>
  >("/api/services/app/MonitoringInfrastructure/GetMonitoredTables", {
    params: { databaseId },
  });

  return unwrapAbpResponse(response.data);
};

export const createMonitoredServer = async (
  input: ICreateMonitoredServerInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IMonitoredServerListItem>
  >("/api/services/app/MonitoringInfrastructure/CreateMonitoredServer", input);

  return unwrapAbpResponse(response.data);
};

export const createMonitoredDatabase = async (
  input: ICreateMonitoredDatabaseInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IMonitoredDatabaseListItem>
  >("/api/services/app/MonitoringInfrastructure/CreateMonitoredDatabase", input);

  return unwrapAbpResponse(response.data);
};

export const createMonitoredTable = async (
  input: ICreateMonitoredTableInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IMonitoredTableListItem>
  >("/api/services/app/MonitoringInfrastructure/CreateMonitoredTable", input);

  return unwrapAbpResponse(response.data);
};

export const bootstrapMonitoringDemo = async (
  input: IBootstrapMonitoringDemoInput,
) => {
  const response = await axiosInstance().post<
    IAbpResponse<IBootstrapMonitoringDemoResult>
  >("/api/services/app/MonitoringInfrastructure/BootstrapDemo", input);

  return unwrapAbpResponse(response.data);
};
