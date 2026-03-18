"use client";

import { Alert, Button, Card, Empty, Input, Select, Switch, Table, Tabs, Tag, Typography } from "antd";
import { useStyles } from "@/app/style/style";
import AppShell from "@/components/auth/AppShell";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";
import {
  ActivityMonitoringProvider,
  useActivityMonitoringActions,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";
import { formatDateTime } from "@/utils/helpers";

const { Paragraph, Text, Title } = Typography;

const EVENT_TYPE_OPTIONS = [
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

const SEVERITY_OPTIONS = [
  { value: 0, label: "Info" },
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Critical" },
] as const;

const resolveEventTypeLabel = (value?: number | string | null) => {
  if (typeof value === "string") {
    return value;
  }

  return EVENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
};

const resolveSeverityLabel = (value?: number | string | null) => {
  if (typeof value === "string") {
    return value;
  }

  return SEVERITY_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
};

const resolveSeverityColor = (value?: number | string | null) => {
  const normalized =
    typeof value === "string"
      ? value.toLowerCase()
      : resolveSeverityLabel(value).toLowerCase();

  if (normalized === "critical") {
    return "red";
  }

  if (normalized === "high") {
    return "volcano";
  }

  if (normalized === "medium") {
    return "gold";
  }

  if (normalized === "low") {
    return "blue";
  }

  return "default";
};

const resolveServerName = (
  serverId: string | null | undefined,
  serverOptions: Array<{ id: string; name: string }>,
) => serverOptions.find((server) => server.id === serverId)?.name ?? serverId ?? "Server not linked";

const ActivityMonitoringPageContent = () => {
  const { styles } = useStyles();
  const {
    activeTab,
    currentPage,
    errorMessage,
    events,
    filterOptions,
    filters,
    hasTenantContext,
    isLoading,
    isRefreshing,
    isSummaryLoading,
    pageSize,
    summary,
    totalCount,
  } = useActivityMonitoringState();
  const {
    applyFilters,
    refresh,
    resetFilters,
    setActiveTab,
    setFilterValue,
    setPagination,
  } = useActivityMonitoringActions();

  if (!hasTenantContext) {
    return (
      <AppShell
        title="Activity Monitoring"
        subtitle="Browse ingested DataSentinel activity records, verify tenant-scoped monitoring intake, and inspect captured event context."
      >
        <Alert
          type="info"
          showIcon
          message="DataSentinel activity monitoring is tenant-scoped. Switch into a tenant before opening this page."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Activity Monitoring"
      subtitle="Browse ingested DataSentinel activity records, verify tenant-scoped monitoring intake, and inspect captured event context."
    >
      {errorMessage ? (
        <Alert type="error" showIcon message={errorMessage} className={styles.alert} />
      ) : null}

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total events</span>
          <span className={styles.statValue}>
            {isSummaryLoading ? "..." : summary.totalEvents}
          </span>
          <span className={styles.statHint}>
            Total tenant-scoped activity events available to monitor.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Suspicious activity</span>
          <span className={styles.statValue}>
            {isSummaryLoading ? "..." : summary.suspiciousActivityCount}
          </span>
          <span className={styles.statHint}>
            Events at medium severity or above.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failed events</span>
          <span className={styles.statValue}>
            {isSummaryLoading ? "..." : summary.failedEventsCount}
          </span>
          <span className={styles.statHint}>
            Failed activity attempts captured by the backend.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <div className={styles.cardToolbar}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              Overview
            </Title>
            <Paragraph className={styles.sectionLead}>
              The backend now exposes summary metrics and activity-specific filter options, so this page is fully wired to the current query surface.
            </Paragraph>
          </div>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Read ops</span>
            <span className={styles.statValue}>{summary.readOps}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Write ops</span>
            <span className={styles.statValue}>{summary.writeOps}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Auth events</span>
            <span className={styles.statValue}>{summary.authEvents}</span>
          </div>
        </div>
      </Card>

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
              options={filterOptions.users.map((user) => ({
                value: user,
                label: user,
              }))}
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
              options={filterOptions.ipAddresses.map((ipAddress) => ({
                value: ipAddress,
                label: ipAddress,
              }))}
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
              options={filterOptions.operations.map((operation) => ({
                value: operation,
                label: operation,
              }))}
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
          <Button onClick={() => void resetFilters()}>
            Reset
          </Button>
          <Button onClick={() => void refresh()} loading={isRefreshing}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className={styles.pageCard}>
        <div className={styles.tableToolbar}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              Activity events
            </Title>
            <Paragraph className={styles.sectionLead}>
              Showing {totalCount} matching event{totalCount === 1 ? "" : "s"} for the current tenant and filter set.
            </Paragraph>
          </div>
        </div>

        <Table<IActivityEventListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={events}
          className={styles.table}
          scroll={{ x: 1320 }}
          locale={{
            emptyText: (
              <Empty
                description={
                  errorMessage
                    ? "The activity feed could not be loaded."
                    : "No activity events matched the current filters."
                }
              />
            ),
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          onChange={(pagination) => {
            void setPagination(
              pagination.current ?? 1,
              pagination.pageSize ?? 25,
            );
          }}
          columns={[
            {
              title: "Event ID",
              dataIndex: "eventId",
              key: "eventId",
              render: (value?: string | null) => value || "Generated event",
            },
            {
              title: "Timestamp",
              dataIndex: "eventTime",
              key: "eventTime",
              render: (_, record) => (
                <>
                  <strong>{formatDateTime(record.eventTime)}</strong>
                  <div className={styles.cellHint}>
                    {record.isOutOfHours ? "Out-of-hours activity" : "Within business hours"}
                  </div>
                </>
              ),
            },
            {
              title: "Event",
              key: "eventType",
              render: (_, record) => (
                <>
                  <Tag color="blue">{resolveEventTypeLabel(record.eventType)}</Tag>
                  <div className={styles.cellHint}>{record.operation || "Operation not provided"}</div>
                </>
              ),
            },
            {
              title: "Actor",
              key: "actor",
              render: (_, record) => (
                <>
                  <strong>{record.actorUser || "Unknown actor"}</strong>
                  <div className={styles.cellHint}>{record.actorIp || "IP not captured"}</div>
                </>
              ),
            },
            {
              title: "Database",
              key: "database",
              render: (_, record) => (
                <>
                  <strong>{record.databaseName || record.databaseId || "Database not linked"}</strong>
                  <div className={styles.cellHint}>
                    {resolveServerName(record.serverId, filterOptions.servers)}
                  </div>
                </>
              ),
            },
            {
              title: "Object",
              dataIndex: "objectName",
              key: "objectName",
              render: (value?: string | null) => value || "No object context",
            },
            {
              title: "Query Preview",
              dataIndex: "queryPreview",
              key: "queryPreview",
              render: (value?: string | null) => value || "Not available",
            },
            {
              title: "Outcome",
              key: "isSuccess",
              render: (_, record) => (
                <>
                  <Tag color={record.isSuccess ? "green" : "red"}>
                    {record.isSuccess ? "Success" : "Failure"}
                  </Tag>
                  <div className={styles.cellHint}>
                    {record.failureReason || "No failure details"}
                  </div>
                </>
              ),
            },
            {
              title: "Severity",
              key: "severity",
              render: (_, record) => (
                <Tag color={resolveSeverityColor(record.severity)}>
                  {resolveSeverityLabel(record.severity)}
                </Tag>
              ),
            },
            {
              title: "Rows",
              key: "rowsAffected",
              render: (_, record) =>
                record.rowsAffected !== null && record.rowsAffected !== undefined
                  ? record.rowsAffected
                  : "N/A",
            },
            {
              title: "Duration",
              key: "duration",
              render: (_, record) =>
                record.durationMs !== null && record.durationMs !== undefined
                  ? `${record.durationMs} ms`
                  : "Not captured",
            },
          ]}
        />
      </Card>
    </AppShell>
  );
};

const ActivityMonitoringPage = () => (
  <ActivityMonitoringProvider>
    <ActivityMonitoringPageContent />
  </ActivityMonitoringProvider>
);

export default withAuth(
  ActivityMonitoringPage,
  PERMISSIONS.dataSentinelActivity,
);
