export const severityLabel = (severity?: number | null) => {
  switch (severity) {
    case 4:
      return "Critical";
    case 3:
      return "High";
    case 2:
      return "Medium";
    case 1:
      return "Low";
    default:
      return "Info";
  }
};

export const severityColor = (severity?: number | null) => {
  switch (severity) {
    case 4:
      return { color: "#b91c1c", background: "#fee2e2" };
    case 3:
      return { color: "#c2410c", background: "#ffedd5" };
    case 2:
      return { color: "#b45309", background: "#fef3c7" };
    case 1:
      return { color: "#1d4ed8", background: "#dbeafe" };
    default:
      return { color: "#475569", background: "#e2e8f0" };
  }
};

export const statusLabel = (status?: number | null) => {
  switch (status) {
    case 1:
      return "Reviewed";
    case 2:
      return "Triaged";
    case 3:
      return "In Progress";
    case 4:
      return "Resolved";
    case 5:
      return "False Positive";
    default:
      return "Unreviewed";
  }
};

export const statusColor = (status?: number | null) => {
  switch (status) {
    case 1:
      return "blue";
    case 2:
      return "purple";
    case 3:
      return "gold";
    case 4:
      return "green";
    case 5:
      return "default";
    default:
      return "red";
  }
};

export const activityTypeLabel = (eventType?: number | null) => {
  switch (eventType) {
    case 1:
      return "Login";
    case 2:
      return "Query";
    case 3:
      return "Read";
    case 4:
      return "Write";
    case 5:
      return "Schema";
    case 6:
      return "Privileged";
    case 7:
      return "Permission";
    case 8:
      return "Export";
    default:
      return "Unknown";
  }
};

export const activityTypeColor = (eventType?: number | null) => {
  switch (eventType) {
    case 1:
      return "purple";
    case 2:
      return "blue";
    case 3:
      return "cyan";
    case 4:
      return "orange";
    case 5:
      return "magenta";
    case 6:
      return "red";
    case 7:
      return "gold";
    case 8:
      return "volcano";
    default:
      return "default";
  }
};

export const toIsoOrUndefined = (value?: string | null) =>
  value ? new Date(value).toISOString() : undefined;
