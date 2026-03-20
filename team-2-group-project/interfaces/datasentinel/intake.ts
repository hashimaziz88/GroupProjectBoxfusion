export interface IActivityEventIngestionItem {
  serverId?: string;
  databaseId?: string;
  eventTime?: string;
  eventType?: number;
  actorUser?: string;
  actorIp?: string;
  objectName?: string;
  operation?: string;
  rowsAffected?: number;
  durationMs?: number;
  isOutOfHours?: boolean;
  severity?: number;
  isSuccess?: boolean;
  failureReason?: string;
  evidence?: Record<string, string>;
}

export interface IAbpAuditLogIngestionItem {
  id?: number;
  tenantId?: number | null;
  userId?: number | null;
  serviceName?: string;
  methodName?: string;
  parameters?: string;
  returnValue?: string | null;
  executionTime?: string;
  executionDuration?: number | null;
  clientIpAddress?: string | null;
  clientName?: string | null;
  browserInfo?: string | null;
  exceptionMessage?: string | null;
  exception?: string | null;
  impersonatorUserId?: number | null;
  impersonatorTenantId?: number | null;
  customData?: string | null;
}

export interface IActivityEventIngestionError {
  itemIndex: number;
  errors?: string[] | null;
}

export interface IIngestionDetectionSummary {
  evaluatedAnchorCount: number;
  createdAlertCount: number;
  duplicateAlertCount: number;
  createdAlertIds?: string[] | null;
}

export interface IActivityEventIngestionResult {
  receivedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  createdEventIds?: string[] | null;
  errors?: IActivityEventIngestionError[] | null;
  detectionSummary?: IIngestionDetectionSummary | null;
}

export interface IIngestActivityEventsInput {
  events: IActivityEventIngestionItem[];
}

export interface IIngestAbpAuditLogsInput {
  serverId?: string;
  databaseId?: string;
  abpAuditLogs: IAbpAuditLogIngestionItem[];
}

export interface ISeedSimulatedAbpAuditLogsInput {
  serverId?: string;
  databaseId?: string;
  count: number;
  seed?: number;
  includeFailures: boolean;
}
