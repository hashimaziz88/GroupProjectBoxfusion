"use client";

import axios from "axios";
import { useEffect, useEffectEvent, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { useAuthState } from "@/providers/authProvider";
import { formatDateTime, toArray } from "@/utils/helpers";
import { getActivityEvents } from "@/utils/datasentinel/activityService";
import { getMonitoredServers } from "@/utils/datasentinel/monitoringService";
import {
  IActivityEventFilters,
  IActivityEventListItem,
} from "@/interfaces/datasentinel/activity";
import { IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";

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

const DEFAULT_FILTERS = {
  keyword: "",
  serverId: undefined as string | undefined,
  databaseId: undefined as string | undefined,
  eventType: undefined as number | undefined,
  severity: undefined as number | undefined,
  status: "all" as "all" | "success" | "failure",
  outOfHours: "all" as "all" | "yes" | "no",
  dateFrom: "",
  dateTo: "",
};

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

const toUtcIsoString = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate.toISOString();
};

const resolveActivityErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return "The activity query endpoint is not available yet. Backend issue #30 still needs to expose /api/services/app/ActivityEvents/GetPagedActivityEvents.";
  }

  return error instanceof Error
    ? error.message
    : "Failed to load activity events.";
};

const ActivityMonitoringPageContent = () => {
  const { styles } = useStyles();
  const { currentTenant } = useAuthState();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [events, setEvents] = useState<IActivityEventListItem[]>([]);
  const [monitoredServers, setMonitoredServers] = useState<IMonitoredServerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [referenceErrorMessage, setReferenceErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const hasTenantContext = Boolean(currentTenant?.tenantId);

  const monitoredDatabases = monitoredServers.flatMap((server) =>
    toArray(server.databases).map((database) => ({
      ...database,
      serverName: server.name,
    })),
  );

  const databaseOptions = (filters.serverId
    ? monitoredDatabases.filter((database) => database.serverId === filters.serverId)
    : monitoredDatabases
  ).map((database) => ({
    value: database.id,
    label: `${database.name} (${database.serverName})`,
  }));

  const buildRequestFilters = (): IActivityEventFilters => ({
    keyword: appliedFilters.keyword.trim() || undefined,
    serverId: appliedFilters.serverId,
    databaseId: appliedFilters.databaseId,
    eventType: appliedFilters.eventType,
    severity: appliedFilters.severity,
    isSuccessful:
      appliedFilters.status === "success"
        ? true
        : appliedFilters.status === "failure"
          ? false
          : undefined,
    isOutOfHours:
      appliedFilters.outOfHours === "yes"
        ? true
        : appliedFilters.outOfHours === "no"
          ? false
          : undefined,
    dateFromUtc: toUtcIsoString(appliedFilters.dateFrom),
    dateToUtc: toUtcIsoString(appliedFilters.dateTo),
    skipCount: (currentPage - 1) * pageSize,
    maxResultCount: pageSize,
  });

  const loadReferenceData = useEffectEvent(async () => {
    try {
      const result = await getMonitoredServers();
      setMonitoredServers(toArray(result.items));
      setReferenceErrorMessage(null);
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.status === 404
          ? "Monitoring reference lookup is not available yet. The frontend can still render, but server and database filters need /api/services/app/MonitoringInfrastructure/GetMonitoredServers."
          : error instanceof Error
            ? error.message
            : "Server and database filter options are unavailable right now.";

      setMonitoredServers([]);
      setReferenceErrorMessage(message);
    }
  });

  const loadActivityEvents = useEffectEvent(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await getActivityEvents(buildRequestFilters());
      setEvents(toArray(result.items));
      setTotalCount(result.totalCount ?? 0);
      setErrorMessage(null);
    } catch (error: unknown) {
      setEvents([]);
      setTotalCount(0);
      setErrorMessage(resolveActivityErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  });

  useEffect(() => {
    if (!hasTenantContext) {
      setMonitoredServers([]);
      setReferenceErrorMessage(null);
      setIsLoading(false);
      return;
    }

    void loadReferenceData();
  }, [hasTenantContext]);

  useEffect(() => {
    if (!hasTenantContext) {
      setEvents([]);
      setTotalCount(0);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    void loadActivityEvents();
  }, [appliedFilters, currentPage, pageSize, hasTenantContext]);

  const failedCount = events.filter((event) => !event.isSuccess).length;
  const outOfHoursCount = events.filter((event) => event.isOutOfHours).length;

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
        <Alert
          type="error"
          showIcon
          message={errorMessage}
          className={styles.alert}
        />
      ) : null}

      {referenceErrorMessage ? (
        <Alert
          type="warning"
          showIcon
          message={referenceErrorMessage}
          className={styles.alert}
        />
      ) : null}

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Visible events</span>
          <span className={styles.statValue}>{totalCount}</span>
          <span className={styles.statHint}>
            Returned by the current activity query filters.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failures on page</span>
          <span className={styles.statValue}>{failedCount}</span>
          <span className={styles.statHint}>
            Quick confirmation that failed activity is being captured.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Out-of-hours on page</span>
          <span className={styles.statValue}>{outOfHoursCount}</span>
          <span className={styles.statHint}>
            Useful once out-of-hours detection rules start building on the same data.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Filters
        </Title>
        <Paragraph className={styles.sectionLead}>
          Search by actor, object, or operation, then narrow by monitored server, database, event type, severity, status, and time window.
        </Paragraph>

        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <Text strong>Search</Text>
            <Input
              value={filters.keyword}
              placeholder="Actor, object, operation"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  keyword: event.target.value,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>Server</Text>
            <Select
              allowClear
              value={filters.serverId}
              placeholder="All monitored servers"
              options={monitoredServers.map((server) => ({
                value: server.id,
                label: `${server.name} (${server.hostName})`,
              }))}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  serverId: value,
                  databaseId: undefined,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>Database</Text>
            <Select
              allowClear
              value={filters.databaseId}
              placeholder="All monitored databases"
              options={databaseOptions}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  databaseId: value,
                }))
              }
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
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  eventType: value,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>Severity</Text>
            <Select
              allowClear
              value={filters.severity}
              placeholder="All severities"
              options={SEVERITY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  severity: value,
                }))
              }
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
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status: value,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>Out-of-hours</Text>
            <Select
              value={filters.outOfHours}
              options={[
                { value: "all", label: "All activity" },
                { value: "yes", label: "Out-of-hours only" },
                { value: "no", label: "Business-hours only" },
              ]}
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  outOfHours: value,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>From</Text>
            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dateFrom: event.target.value,
                }))
              }
            />
          </div>

          <div className={styles.filterField}>
            <Text strong>To</Text>
            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  dateTo: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className={styles.filterActionsRow}>
          <Button
            type="primary"
            onClick={() => {
              setCurrentPage(1);
              setAppliedFilters(filters);
            }}
          >
            Apply filters
          </Button>
          <Button
            onClick={() => {
              setCurrentPage(1);
              setPageSize(25);
              setFilters(DEFAULT_FILTERS);
              setAppliedFilters(DEFAULT_FILTERS);
            }}
          >
            Reset
          </Button>
          <Button onClick={() => void loadActivityEvents(true)} loading={isRefreshing}>
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
              This view is wired for the expected ABP activity query endpoint and will immediately become live once backend issue #30 lands.
            </Paragraph>
          </div>
        </div>

        <Table<IActivityEventListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={events}
          className={styles.table}
          scroll={{ x: 1180 }}
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
            setCurrentPage(pagination.current ?? 1);
            setPageSize(pagination.pageSize ?? 25);
          }}
          columns={[
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
              title: "Database context",
              key: "database",
              render: (_, record) => (
                <>
                  <strong>{record.databaseName || record.databaseId || "Database not linked"}</strong>
                  <div className={styles.cellHint}>
                    {record.serverName || record.serverId || "Server not linked"}
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

export default withAuth(
  ActivityMonitoringPageContent,
  PERMISSIONS.dataSentinelActivity,
);
