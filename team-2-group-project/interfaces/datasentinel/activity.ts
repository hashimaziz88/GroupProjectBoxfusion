export type ActivityTab = "all" | "suspicious" | "failed";
export type ActivityStatusFilter = "all" | "success" | "failure";

export interface IActivityEventFilters {
  keyword?: string;
  serverId?: string;
  databaseId?: string;
  actorUser?: string;
  actorIp?: string;
  operation?: string;
  eventType?: number;
  severity?: number;
  isSuccess?: boolean;
  startDate?: string;
  endDate?: string;
  tab?: number;
  sortDescending?: boolean;
  skipCount: number;
  maxResultCount: number;
}

export interface IActivityEventListItem {
  id: string;
  eventId?: string | null;
  eventTime: string;
  eventType: number | string;
  severity: number | string;
  actorUser?: string | null;
  actorIp?: string | null;
  objectName?: string | null;
  operation?: string | null;
  rowsAffected?: number | null;
  durationMs?: number | null;
  isOutOfHours: boolean;
  isSuccess: boolean;
  failureReason?: string | null;
  databaseId?: string | null;
  databaseName?: string | null;
  serverId?: string | null;
  queryPreview?: string | null;
}

export interface IActivitySummary {
  totalEvents: number;
  readOps: number;
  writeOps: number;
  authEvents: number;
  privilegedOps: number;
  suspiciousActivityCount: number;
  failedEventsCount: number;
}

export interface IActivityFilterDatabaseOption {
  id: string;
  name: string;
}

export interface IActivityFilterServerOption {
  id: string;
  name: string;
}

export interface IActivityFilterOptions {
  databases: IActivityFilterDatabaseOption[];
  servers: IActivityFilterServerOption[];
  users: string[];
  ipAddresses: string[];
  operations: string[];
}

export interface IActivityFilterDraft {
  keyword: string;
  serverId?: string;
  databaseId?: string;
  actorUser?: string;
  actorIp?: string;
  operation?: string;
  eventType?: number;
  severity?: number;
  status: ActivityStatusFilter;
  startDate: string;
  endDate: string;
  sortDescending: boolean;
}
