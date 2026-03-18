"use client";

import { Card, Empty, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/activity/style/style";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";
import {
  useActivityMonitoringActions,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";
import {
  resolveEventTypeLabel,
  resolveServerName,
  resolveSeverityColor,
  resolveSeverityLabel,
} from "@/utils/datasentinel/activityHelpers";
import { formatDateTime } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const ActivityEventsTable = () => {
  const { styles } = useStyles();
  const {
    currentPage,
    errorMessage,
    events,
    filterOptions,
    isLoading,
    pageSize,
    totalCount,
  } = useActivityMonitoringState();
  const { setPagination } = useActivityMonitoringActions();

  return (
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
          void setPagination(pagination.current ?? 1, pagination.pageSize ?? 25);
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
  );
};

export default ActivityEventsTable;
