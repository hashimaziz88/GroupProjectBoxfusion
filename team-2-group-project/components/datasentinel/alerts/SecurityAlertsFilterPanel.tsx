"use client";

import { Button, Card, Input, Select, Typography, Tag, Space } from "antd";
import {
  ALERT_SEVERITY_OPTIONS,
  ALERT_STATUS_OPTIONS,
} from "@/constants/datasentinel/alerts";
import {
  useSecurityAlertsActions,
  useSecurityAlertsState,
} from "@/providers/securityAlertsProvider";
import { useStyles } from "./style/style";

const { Paragraph, Text, Title } = Typography;

const SecurityAlertsFilterPanel = () => {
  const { styles } = useStyles();
  const { filterOptions, filters, isRefreshing } = useSecurityAlertsState();
  const { applyFilters, refresh, resetFilters, setFilterValue } =
    useSecurityAlertsActions();

  return (
    <Card className={styles.pageCard}>
      <Title level={4} className={styles.sectionTitle}>
        Filters
      </Title>
      <Paragraph className={styles.sectionLead}>
        Search by alert title, summary, or actor, then narrow by severity, review status, database, and time window.
      </Paragraph>

      <div className={styles.filterGrid}>
        <div className={styles.filterField}>
          <Text strong>Search</Text>
          <Input
            value={filters.keyword}
            placeholder="Title, summary, actor"
            onChange={(event) => setFilterValue("keyword", event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Severity</Text>
          <Select
            allowClear
            value={filters.severity}
            placeholder="All severities"
            options={ALERT_SEVERITY_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => setFilterValue("severity", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Status</Text>
          <Select
            allowClear
            value={filters.status}
            placeholder="All statuses"
            options={ALERT_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => setFilterValue("status", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Database</Text>
          <Select
            allowClear
            value={filters.databaseId}
            placeholder="All databases"
            options={filterOptions.databases.map((database) => ({
              value: database.id,
              label: database.name,
            }))}
            onChange={(value) => setFilterValue("databaseId", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>From</Text>
          <Input
            type="datetime-local"
            value={filters.startDate}
            onChange={(event) => setFilterValue("startDate", event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>To</Text>
          <Input
            type="datetime-local"
            value={filters.endDate}
            onChange={(event) => setFilterValue("endDate", event.target.value)}
          />
        </div>
      </div>

      {/* Active filters: show removable chips when filters applied */}
      <div className={styles.activeFiltersRow}>
        <Space size="small" wrap>
          {Object.entries(filters)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([key, value]) => {
              // derive a human-friendly label for the filter value
              let displayValue: string;
              if (Array.isArray(value)) {
                displayValue = value.join(", ");
              } else if (key === "severity") {
                displayValue = (
                  ALERT_SEVERITY_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
                );
              } else if (key === "status") {
                displayValue = (
                  ALERT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
                );
              } else if (key === "databaseId") {
                const db = filterOptions.databases.find((d) => String(d.id) === String(value));
                displayValue = db ? db.name : String(value);
              } else if (key === "startDate" || key === "endDate") {
                try {
                  displayValue = new Date(String(value)).toLocaleString();
                } catch {
                  displayValue = String(value);
                }
              } else {
                displayValue = String(value);
              }

              const keyLabelMap: Record<string, string> = {
                keyword: "Search",
                severity: "Severity",
                status: "Status",
                databaseId: "Database",
                startDate: "From",
                endDate: "To",
              };

              const labelKey = keyLabelMap[key] ?? key;

              return (
                <Tag
                  key={key}
                  color="default"
                  closable
                  onClose={() => setFilterValue(key as any, null)}
                  style={{ marginBottom: 6 }}
                >
                  {labelKey}: {displayValue}
                </Tag>
              );
            })}

          {Object.values(filters).some((v) => v !== null && v !== undefined && v !== "") ? (
            <Button type="link" onClick={() => resetFilters()} style={{ marginLeft: 8 }}>
              Clear all
            </Button>
          ) : (
            <span className={styles.mutedText}>No filters applied</span>
          )}
        </Space>
      </div>

      <div className={styles.filterActionsRow}>
        <Button type="primary" onClick={() => void applyFilters()}>
          Apply filters
        </Button>
        <Button onClick={() => void resetFilters()}>Reset</Button>
        <Button onClick={() => void refresh()} loading={isRefreshing}>
          Refresh
        </Button>
      </div>
    </Card>
  );
};

export default SecurityAlertsFilterPanel;
