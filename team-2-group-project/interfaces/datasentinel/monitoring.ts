export interface IListResult<T> {
  items?: T[] | null;
}

export interface IMonitoredTableListItem {
  id: string;
  databaseId: string;
  schemaName: string;
  name: string;
  description?: string | null;
  isEnabled: boolean;
  lastActivityAt?: string | null;
}

export interface IMonitoredDatabaseListItem {
  id: string;
  serverId: string;
  name: string;
  engine: string;
  description?: string | null;
  isEnabled: boolean;
  lastActivityAt?: string | null;
  tables?: IMonitoredTableListItem[] | null;
}

export interface IMonitoredServerListItem {
  id: string;
  name: string;
  hostName: string;
  environment: string;
  description?: string | null;
  isEnabled: boolean;
  lastHeartbeatAt?: string | null;
  databases?: IMonitoredDatabaseListItem[] | null;
}

export interface ICreateMonitoredServerInput {
  name: string;
  hostName: string;
  environment: string;
  description?: string;
  isEnabled: boolean;
}

export interface ICreateMonitoredDatabaseInput {
  serverId: string;
  name: string;
  engine: string;
  description?: string;
  isEnabled: boolean;
}

export interface ICreateMonitoredTableInput {
  databaseId: string;
  schemaName: string;
  name: string;
  description?: string;
  isEnabled: boolean;
}

export interface IBootstrapMonitoringDemoInput {
  serverName?: string;
  hostName?: string;
  environment?: string;
  includeTables: boolean;
}

export interface IBootstrapMonitoringDemoResult {
  createdServersCount: number;
  createdDatabasesCount: number;
  createdTablesCount: number;
  servers?: IMonitoredServerListItem[] | null;
}
