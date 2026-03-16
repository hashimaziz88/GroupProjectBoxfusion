"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Card, Input, Select, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import SeverityTag from "@/components/datasentinel/SeverityTag";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { ACTIVITY_EVENT_TYPE_OPTIONS } from "@/constants/datasentinel/options";
import { useStyles } from "@/app/style/style";
import { IActivityEventListItem } from "@/interfaces/datasentinel";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { activityTypeColor, activityTypeLabel } from "@/utils/datasentinel/helpers";
import { formatDateTime, toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const ActivityPageContent = () => {
  const { styles } = useStyles();
  const {
    activityEvents,
    monitoredDatabases,
    isActivityPending,
    errorMessage,
  } = useDataSentinelState();
  const { loadActivityEvents, loadAssets } = useDataSentinelActions();
  const [keyword, setKeyword] = useState("");
  const [eventType, setEventType] = useState<number | undefined>();
  const [databaseId, setDatabaseId] = useState<number | undefined>();
  const [isSuccessful, setIsSuccessful] = useState<boolean | undefined>();

  const loadAssetsOnMount = useEffectEvent(async () => {
    await loadAssets();
  });

  const syncActivityEvents = useEffectEvent(async () => {
    await loadActivityEvents({
      keyword: keyword || undefined,
      eventType,
      databaseId,
      isSuccessful,
      skipCount: 0,
      maxResultCount: 100,
    });
  });

  useEffect(() => {
    void loadAssetsOnMount();
  }, []);

  useEffect(() => {
    void syncActivityEvents();
  }, [databaseId, eventType, isSuccessful, keyword]);

  const events = toArray(activityEvents);
  const databases = toArray(monitoredDatabases);

  const summary = useMemo(
    () => ({
      failed: events.filter((item) => !item.isSuccessful).length,
      outOfHours: events.filter((item) => item.isOutOfHours).length,
      privileged: events.filter((item) => item.isPrivilegedAction).length,
    }),
    [events],
  );

  return (
    <AppShell
      title="Activity Events"
      subtitle="Inspect recent SQL-related events, including reads, writes, login attempts, and privileged operations."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Events</span>
          <span className={styles.statValue}>{events.length}</span>
          <span className={styles.statHint}>Current filtered activity window.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failed</span>
          <span className={styles.statValue}>{summary.failed}</span>
          <span className={styles.statHint}>Events that ended unsuccessfully.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Out of hours</span>
          <span className={styles.statValue}>{summary.outOfHours}</span>
          <span className={styles.statHint}>Events that occurred outside the normal business window.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Privileged</span>
          <span className={styles.statValue}>{summary.privileged}</span>
          <span className={styles.statHint}>Sensitive operations and access-control changes.</span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Event stream
        </Title>
        <Paragraph className={styles.sectionLead}>
          Filter and inspect activity to understand what happened around a suspicious period before opening a specific alert.
        </Paragraph>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <Input
            placeholder="Search actor, object, or query"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            allowClear
            placeholder="Event type"
            value={eventType}
            onChange={(value) => setEventType(value)}
            options={ACTIVITY_EVENT_TYPE_OPTIONS.map((item) => ({ ...item }))}
          />
          <Select
            allowClear
            placeholder="Database"
            value={databaseId}
            onChange={(value) => setDatabaseId(value)}
            options={databases.map((database) => ({
              label: database.name,
              value: database.id,
            }))}
          />
          <Select
            allowClear
            placeholder="Outcome"
            value={isSuccessful}
            onChange={(value) => setIsSuccessful(value)}
            options={[
              { label: "Successful", value: true },
              { label: "Failed", value: false },
            ]}
          />
        </div>

        <QueryState
          isLoading={isActivityPending}
          errorMessage={errorMessage}
          isEmpty={!events.length}
          emptyDescription="No activity events match the current filters."
        >
          <Table<IActivityEventListItem>
            rowKey="id"
            pagination={false}
            dataSource={events}
            className={styles.table}
            columns={[
              {
                title: "Time",
                dataIndex: "eventTime",
                key: "eventTime",
                render: (value: string) => formatDateTime(value),
              },
              {
                title: "Type",
                dataIndex: "eventType",
                key: "eventType",
                render: (value: number) => (
                  <Tag color={activityTypeColor(value)}>{activityTypeLabel(value)}</Tag>
                ),
              },
              {
                title: "Server / DB",
                key: "asset",
                render: (_, record) => (
                  <div>
                    <div>{record.serverName || "Unknown server"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {record.databaseName || "Unknown database"}
                    </div>
                  </div>
                ),
              },
              {
                title: "Actor",
                key: "actor",
                render: (_, record) => (
                  <div>
                    <div>{record.actorUser || "Unknown actor"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {record.actorIp || "No IP"}
                    </div>
                  </div>
                ),
              },
              {
                title: "Operation",
                key: "operation",
                render: (_, record) => (
                  <div>
                    <div>{record.operation || "N/A"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {record.objectName || "No object recorded"}
                    </div>
                  </div>
                ),
              },
              {
                title: "Impact",
                key: "impact",
                render: (_, record) => (
                  <div>
                    <SeverityTag severity={record.severity} />
                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                      {record.rowsAffected ?? 0} rows • {record.durationMs} ms
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </QueryState>
      </Card>
    </AppShell>
  );
};

export default withAuth(ActivityPageContent, PERMISSIONS.datasentinelDashboard);
