export const ALERT_SEVERITY_OPTIONS = [
  { value: 4, label: "Critical" },
  { value: 3, label: "High" },
  { value: 2, label: "Medium" },
  { value: 1, label: "Low" },
  { value: 0, label: "Info" },
] as const;

export const ALERT_STATUS_OPTIONS = [
  { value: 0, label: "New" },
  { value: 1, label: "Acknowledged" },
  { value: 2, label: "Investigating" },
  { value: 3, label: "Resolved" },
  { value: 4, label: "Dismissed" },
] as const;

export const ALERT_REVIEW_STATUS_OPTIONS = ALERT_STATUS_OPTIONS.filter(
  (option) => option.value !== 0,
);
