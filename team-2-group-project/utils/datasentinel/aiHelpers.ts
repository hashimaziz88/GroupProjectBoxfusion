import { ALERT_SEVERITY_OPTIONS, ALERT_STATUS_OPTIONS } from "@/constants/datasentinel/alerts";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";

export const getSeverityLabel = (severity: number): string =>
  ALERT_SEVERITY_OPTIONS.find((o) => o.value === severity)?.label ?? "Unknown";

export const getStatusLabel = (status: number): string =>
  ALERT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Unknown";

export const formatEventSample = (events: IActivityEventListItem[]): string => {
  if (!events.length) return "  (no individual events provided)";
  return events
    .slice(0, 10)
    .map((e) => {
      const time = new Date(e.eventTime).toISOString().replace("T", " ").slice(0, 19);
      const op = e.operation ?? "UNKNOWN_OP";
      const obj = e.objectName ?? e.databaseName ?? "unknown object";
      const rows = e.rowsAffected != null ? `${e.rowsAffected} rows` : "";
      const outcome = e.isSuccess
        ? "succeeded"
        : `FAILED${e.failureReason ? ` (${e.failureReason})` : ""}`;
      const duration = e.durationMs != null ? ` ${e.durationMs}ms` : "";
      return `  • ${time}  ${op} on ${obj}${rows ? "  " + rows : ""}  ${outcome}${duration}`;
    })
    .join("\n");
};
