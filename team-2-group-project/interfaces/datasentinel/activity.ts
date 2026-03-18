export interface IActivityEventFilters {
  keyword?: string;
  serverId?: string;
  databaseId?: string;
  eventType?: number;
  severity?: number;
  isSuccessful?: boolean;
  isOutOfHours?: boolean;
  dateFromUtc?: string;
  dateToUtc?: string;
  skipCount: number;
  maxResultCount: number;
}

export interface IActivityEventListItem {
  id: string | number;
  eventTime: string;
  eventType: number | string;
  actorUser?: string | null;
  actorIp?: string | null;
  objectName?: string | null;
  operation?: string | null;
  rowsAffected?: number | null;
  durationMs?: number | null;
  isOutOfHours: boolean;
  severity: number | string;
  isSuccess: boolean;
  failureReason?: string | null;
  serverId?: string | null;
  serverName?: string | null;
  databaseId?: string | null;
  databaseName?: string | null;
}
