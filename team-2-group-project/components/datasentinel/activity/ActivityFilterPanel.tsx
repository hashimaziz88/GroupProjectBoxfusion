"use client";

import { Button, Card, DatePicker, Input, Select, Switch, Tabs, Typography, Tag, Space } from "antd";
import dayjs from "dayjs";
import { useStyles } from "@/components/datasentinel/activity/style/style";
import { EVENT_TYPE_OPTIONS, SEVERITY_OPTIONS } from "@/constants/datasentinel/activity";
import {
  useActivityMonitoringActions,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";
import { DEFAULT_FILTERS } from "@/providers/activityMonitoringProvider/context";
import { IActivityFilterDraft } from "@/interfaces/datasentinel/activity";

const { Text, Title, Paragraph } = Typography;

const ActivityFilterPanel = () => {
  const { styles } = useStyles();
  const { activeTab, filterOptions, filters, isRefreshing, summary } =
    useActivityMonitoringState();
  const { applyFilters, refresh, resetFilters, setActiveTab, setFilterValue } =
    useActivityMonitoringActions();

  const dateError =
    !!filters.startDate &&
    !!filters.endDate &&
    new Date(filters.endDate) <= new Date(filters.startDate);

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
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
            value={filters.startDate ? dayjs(filters.startDate) : null}
            onChange={(date) => setFilterValue("startDate", date ? date.toISOString() : "")}
          />
        </div>

        <div className={styles.filterField}>
          <Text strong>To</Text>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
            status={dateError ? "error" : undefined}
            value={filters.endDate ? dayjs(filters.endDate) : null}
            onChange={(date) => setFilterValue("endDate", date ? date.toISOString() : "")}
          />
          {dateError && (
            <Text type="danger" style={{ fontSize: 12 }}>
              End date must be after start date
            </Text>
          )}
        </div>

        <div className={styles.filterField}>
          <Text strong>Newest first</Text>
          <Switch
            checked={filters.sortDescending}
            onChange={(checked) => setFilterValue("sortDescending", checked)}
          />
        </div>
      </div>

      {/* Active filters: show removable chips when filters applied */}
      <div className={styles.activeFiltersRow}>
        <Space size="small" wrap>
          {(Object.keys(filters) as Array<keyof IActivityFilterDraft>)
            .filter((k) => {
              const v = filters[k];
              return v !== null && v !== undefined && v !== "";
            })
            .map((key) => {
              const value = filters[key] as unknown;
              let displayValue: string;
              if (Array.isArray(value)) {
                displayValue = (value as unknown[]).join(", ");
              } else if (key === "eventType") {
                displayValue = EVENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
              } else if (key === "severity") {
                displayValue = SEVERITY_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
              } else if (key === "serverId") {
                const s = filterOptions.servers.find((d) => String(d.id) === String(value));
                displayValue = s ? s.name : String(value);
              } else if (key === "databaseId") {
                const d = filterOptions.databases.find((d) => String(d.id) === String(value));
                displayValue = d ? d.name : String(value);
              } else if (key === "startDate" || key === "endDate") {
                try {
                  displayValue = new Date(String(value)).toLocaleString();
                } catch {
                  displayValue = String(value);
                }
              } else if (typeof value === "boolean") {
                displayValue = (value as boolean) ? "Yes" : "No";
              } else {
                displayValue = String(value);
              }

              const keyLabelMap: Partial<Record<keyof IActivityFilterDraft, string>> = {
                keyword: "Search",
                serverId: "Server",
                databaseId: "Database",
                actorUser: "User",
                actorIp: "IP",
                operation: "Operation",
                eventType: "Event type",
                severity: "Severity",
                status: "Status",
                startDate: "From",
                endDate: "To",
                sortDescending: "Newest first",
              };

              const labelKey = keyLabelMap[key] ?? String(key);

              return (
                <Tag
                  key={String(key)}
                  color="default"
                  closable
                  onClose={() => setFilterValue(key, DEFAULT_FILTERS[key])}
                  style={{ marginBottom: 6 }}
                >
                  {labelKey}: {displayValue}
                </Tag>
              );
            })}

          {Object.values(filters).some((v) => v !== null && v !== undefined && v !== "") ? (
            <Button
              type="link"
              onClick={() => {
                resetFilters();
                // ensure newest-first toggle is turned off as part of a full clear
                setFilterValue("sortDescending", false);
                void applyFilters();
              }}
              style={{ marginLeft: 8 }}
            >
              Clear all
            </Button>
          ) : (
            <span className={styles.mutedText}>No filters applied</span>
          )}
        </Space>
      </div>

      <div className={styles.filterActionsRow}>
        <Button type="primary" onClick={() => void applyFilters()} disabled={dateError}>
          Apply filters
        </Button>
        <Button
          onClick={() => {
            resetFilters();
            // ensure newest-first toggle is turned off
            setFilterValue("sortDescending", false);
            void applyFilters();
          }}
        >
          Reset
        </Button>
        <Button onClick={() => void refresh()} loading={isRefreshing}>
          Refresh
        </Button>
      </div>
    </Card>
  );
};

export default ActivityFilterPanel;
