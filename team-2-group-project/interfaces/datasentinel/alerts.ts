export interface IAlertDatabaseOption {
  id: string;
  name: string;
}

export interface ISecurityAlertFilters {
  keyword?: string;
  severity?: number;
  status?: number;
  databaseId?: string;
  startDate?: string;
  endDate?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface ISecurityAlertFilterDraft {
  keyword: string;
  severity?: number;
  status?: number;
  databaseId?: string;
  startDate: string;
  endDate: string;
}

export interface ISecurityAlertListItem {
  id: string;
  alertId: string;
  title: string;
  summary: string;
  severity: number;
  riskScore: number;
  status: number;
  triggeredAt: string;
  serverId?: string | null;
  serverName?: string | null;
  databaseId?: string | null;
  databaseName?: string | null;
  tableId?: string | null;
  tableName?: string | null;
  primaryActorUser?: string | null;
  primaryActorIp?: string | null;
  eventTimeStart: string;
  eventTimeEnd: string;
  relatedEventCount: number;
}

export interface ISecurityAlertDetail extends ISecurityAlertListItem {
  recommendedActions: string[];
}

export interface IIncidentNote {
  id: string;
  alertId: string;
  body: string;
  isInternal: boolean;
  creationTime: string;
  creatorUserId?: number | null;
  creatorUserDisplayName?: string | null;
}

export interface IAlertStatusHistoryItem {
  id: string;
  alertId: string;
  fromStatus: number;
  toStatus: number;
  comment?: string | null;
  creationTime: string;
  creatorUserId?: number | null;
  creatorUserDisplayName?: string | null;
}

export interface ISecurityAlertFilterOptions {
  databases: IAlertDatabaseOption[];
}

export interface IUpdateAlertStatusInput {
  alertId: string;
  newStatus: number;
  comment?: string;
}

export interface IBulkUpdateAlertStatusInput {
  alertIds: string[];
  newStatus: number;
  comment?: string;
}

export interface ICreateIncidentNoteInput {
  alertId: string;
  body: string;
  isInternal: boolean;
}
