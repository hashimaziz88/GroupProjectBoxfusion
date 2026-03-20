import {
  IAbpAuditLogIngestionItem,
  IActivityEventIngestionItem,
} from "@/interfaces/datasentinel/intake";
import { resolveAbpErrorMessage } from "@/utils/abp";

export const resolveErrorMessage = (error: unknown): string =>
  resolveAbpErrorMessage(error, "The intake request failed.");

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const parseJsonPayload = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("The JSON payload could not be parsed. Check the uploaded content and try again.");
  }
};

export const extractActivityEvents = (payload: unknown): IActivityEventIngestionItem[] => {
  if (Array.isArray(payload)) {
    return payload as IActivityEventIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.events)) {
    return payload.events as IActivityEventIngestionItem[];
  }

  throw new Error(
    "Manual activity payload must be an array or an object with an events array.",
  );
};

export const extractAuditLogs = (payload: unknown): IAbpAuditLogIngestionItem[] => {
  if (Array.isArray(payload)) {
    return payload as IAbpAuditLogIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.abpAuditLogs)) {
    return payload.abpAuditLogs as IAbpAuditLogIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.AbpAuditLogs)) {
    return payload.AbpAuditLogs as IAbpAuditLogIngestionItem[];
  }

  throw new Error(
    "ABP audit payload must be an array or an object with an abpAuditLogs/AbpAuditLogs array.",
  );
};

export const normalizeAuditLogsForTenant = (
  auditLogs: IAbpAuditLogIngestionItem[],
  tenantId: number,
) => {
  let normalizedCount = 0;

  const normalizedAuditLogs = auditLogs.map((auditLog) => {
    if (auditLog.tenantId === tenantId) {
      return auditLog;
    }

    normalizedCount += 1;

    return {
      ...auditLog,
      tenantId,
    };
  });

  return {
    normalizedAuditLogs,
    normalizedCount,
  };
};

export const applyReferenceDefaults = (
  events: IActivityEventIngestionItem[],
  serverId?: string,
  databaseId?: string,
): IActivityEventIngestionItem[] =>
  events.map((event) => ({
    ...event,
    serverId: event.serverId ?? serverId,
    databaseId: event.databaseId ?? databaseId,
  }));

export const resolveDatabaseOptions = (
  databases: Array<{ id: string; name: string; serverId: string; serverName: string }>,
  serverId?: string,
) =>
  (serverId
    ? databases.filter((database) => database.serverId === serverId)
    : databases
  ).map((database) => ({
    value: database.id,
    label: `${database.name} (${database.serverName})`,
  }));
