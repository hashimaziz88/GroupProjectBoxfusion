export const ALERT_SEVERITY_OPTIONS = [
  { label: "Critical", value: 4 },
  { label: "High", value: 3 },
  { label: "Medium", value: 2 },
  { label: "Low", value: 1 },
  { label: "Info", value: 0 },
] as const;

export const ALERT_STATUS_OPTIONS = [
  { label: "Unreviewed", value: 0 },
  { label: "Reviewed", value: 1 },
  { label: "Triaged", value: 2 },
  { label: "In Progress", value: 3 },
  { label: "Resolved", value: 4 },
  { label: "False Positive", value: 5 },
] as const;

export const ACTIVITY_EVENT_TYPE_OPTIONS = [
  { label: "Login", value: 1 },
  { label: "Query", value: 2 },
  { label: "Read", value: 3 },
  { label: "Write", value: 4 },
  { label: "Schema", value: 5 },
  { label: "Privileged", value: 6 },
  { label: "Permission", value: 7 },
  { label: "Export", value: 8 },
] as const;
