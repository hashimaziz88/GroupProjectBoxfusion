import { EVENT_TYPE_OPTIONS, SEVERITY_OPTIONS } from "@/constants/datasentinel/activity";
import { ALERT_STATUS_OPTIONS } from "@/constants/datasentinel/alerts";

export const resolveEventTypeLabel = (value?: number | string | null): string => {
  if (typeof value === "string") {
    return value;
  }

  return EVENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
};

export const resolveSeverityLabel = (value?: number | string | null): string => {
  if (typeof value === "string") {
    return value;
  }

  return SEVERITY_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
};

export const resolveSeverityColor = (value?: number | string | null): string => {
  const normalized =
    typeof value === "string"
      ? value.toLowerCase()
      : resolveSeverityLabel(value).toLowerCase();

  if (normalized === "critical") return "red";
  if (normalized === "high") return "volcano";
  if (normalized === "medium") return "gold";
  if (normalized === "low") return "blue";

  return "default";
};

export const resolveServerName = (
  serverId: string | null | undefined,
  serverOptions: Array<{ id: string; name: string }>,
): string => serverOptions.find((server) => server.id === serverId)?.name ?? serverId ?? "Server not linked";

export const resolveAlertSeverityLabel = (value?: number | string | null): string =>
  resolveSeverityLabel(value);

export const resolveAlertSeverityColor = (value?: number | string | null): string =>
  resolveSeverityColor(value);

export const resolveAlertStatusLabel = (value?: number | string | null): string => {
  if (typeof value === "string") {
    return value;
  }

  return ALERT_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
};

export const resolveAlertStatusColor = (value?: number | string | null): string => {
  const normalized = resolveAlertStatusLabel(value).toLowerCase();

  if (normalized === "new") return "red";
  if (normalized === "acknowledged") return "orange";
  if (normalized === "investigating") return "processing";
  if (normalized === "resolved") return "green";
  if (normalized === "dismissed") return "default";

  return "default";
};
