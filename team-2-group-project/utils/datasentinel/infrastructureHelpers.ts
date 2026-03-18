import { IMonitoredDatabaseListItem, IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";

export const resolveServerName = (
  servers: IMonitoredServerListItem[],
  serverId: string,
): string => servers.find((server) => server.id === serverId)?.name ?? "Unknown server";

export const resolveDatabaseName = (
  databases: IMonitoredDatabaseListItem[],
  databaseId: string,
): string => databases.find((database) => database.id === databaseId)?.name ?? "Unknown database";
