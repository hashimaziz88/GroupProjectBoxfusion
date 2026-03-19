"use client";

import { Button, Card, Input, Select, Typography } from "antd";
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
