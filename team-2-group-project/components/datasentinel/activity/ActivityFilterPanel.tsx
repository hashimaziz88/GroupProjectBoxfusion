"use client";

import { Button, Card, Input, Select, Switch, Tabs, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/activity/style/style";
import { EVENT_TYPE_OPTIONS, SEVERITY_OPTIONS } from "@/constants/datasentinel/activity";
import {
  useActivityMonitoringActions,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";

const { Text, Title, Paragraph } = Typography;

const ActivityFilterPanel = () => {
  const { styles } = useStyles();
  const { activeTab, filterOptions, filters, isRefreshing, summary } =
    useActivityMonitoringState();
  const { applyFilters, refresh, resetFilters, setActiveTab, setFilterValue } =
    useActivityMonitoringActions();

  return (
    <Card className={styles.pageCard}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => void setActiveTab(key as "all" | "suspicious" | "failed")}
        items={[
          { key: "all", label: `All (${summary.totalEvents})` },
          {
            key: "suspicious",
            label: `Suspicious Activity (${summary.suspiciousActivityCount})`,
          },
          { key: "failed", label: `Failed Events (${summary.failedEventsCount})` },
        ]}
      />

      <Title level={4} className={styles.sectionTitle}>
        Filters
      </Title>
      <Paragraph className={styles.sectionLead}>
        Search by actor, IP, object, or operation, then narrow by server, database, event type, severity, and time range.
      </Paragraph>

      <div className={styles.filterGrid}>
        <div className={styles.filterField}>
          <Text strong>Search</Text>
          <Input
            value={filters.keyword}
            placeholder="Actor, object, operation, failure"
            onChange={(event) => setFilterValue("keyword", event.target.value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Server</Text>
          <Select
            allowClear
            value={filters.serverId}
            placeholder="All servers"
            options={filterOptions.servers.map((server) => ({
              value: server.id,
              label: server.name,
            }))}
            onChange={(value) => setFilterValue("serverId", value)}
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
          <Text strong>User</Text>
          <Select
            allowClear
            showSearch
            value={filters.actorUser}
            placeholder="All users"
            options={filterOptions.users.map((user) => ({ value: user, label: user }))}
            onChange={(value) => setFilterValue("actorUser", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>IP address</Text>
          <Select
            allowClear
            showSearch
            value={filters.actorIp}
            placeholder="All IPs"
            options={filterOptions.ipAddresses.map((ip) => ({ value: ip, label: ip }))}
            onChange={(value) => setFilterValue("actorIp", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Operation</Text>
          <Select
            allowClear
            showSearch
            value={filters.operation}
            placeholder="All operations"
            options={filterOptions.operations.map((op) => ({ value: op, label: op }))}
            onChange={(value) => setFilterValue("operation", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Event type</Text>
          <Select
            allowClear
            value={filters.eventType}
            placeholder="All event types"
            options={EVENT_TYPE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => setFilterValue("eventType", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Min severity</Text>
          <Select
            allowClear
            value={filters.severity}
            placeholder="All severities"
            options={SEVERITY_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => setFilterValue("severity", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>Status</Text>
          <Select
            value={filters.status}
            options={[
              { value: "all", label: "All outcomes" },
              { value: "success", label: "Success only" },
              { value: "failure", label: "Failure only" },
            ]}
            onChange={(value) => setFilterValue("status", value)}
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

        <div className={styles.filterField}>
          <Text strong>Newest first</Text>
          <Switch
            checked={filters.sortDescending}
            onChange={(checked) => setFilterValue("sortDescending", checked)}
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

export default ActivityFilterPanel;
