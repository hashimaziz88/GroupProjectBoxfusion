export const EVENT_TYPE_OPTIONS = [
  { value: 0, label: "Login" },
  { value: 1, label: "Logout" },
  { value: 2, label: "Read" },
  { value: 3, label: "Write" },
  { value: 4, label: "Delete" },
  { value: 5, label: "Schema change" },
  { value: 6, label: "Privileged action" },
  { value: 7, label: "Permission change" },
  { value: 8, label: "Bulk operation" },
  { value: 99, label: "Other" },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 0, label: "Info" },
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
] as const;
