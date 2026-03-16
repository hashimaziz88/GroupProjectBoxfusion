"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Button, Card, Input, Select, Switch, Table, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import SeverityTag from "@/components/datasentinel/SeverityTag";
import StatusTag from "@/components/datasentinel/StatusTag";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import {
  ALERT_SEVERITY_OPTIONS,
  ALERT_STATUS_OPTIONS,
} from "@/constants/datasentinel/options";
import { useStyles } from "@/app/style/style";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { formatDateTime, toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const AlertsPageContent = () => {
  const { styles } = useStyles();
  const {
    alerts,
    monitoredServers,
    monitoredDatabases,
    isAlertsPending,
    errorMessage,
  } = useDataSentinelState();
  const { loadAlerts, loadAssets } = useDataSentinelActions();
  const [keyword, setKeyword] = useState("");
  const [severity, setSeverity] = useState<number | undefined>();
  const [status, setStatus] = useState<number | undefined>();
  const [databaseId, setDatabaseId] = useState<number | undefined>();
  const [serverId, setServerId] = useState<number | undefined>();
  const [openOnly, setOpenOnly] = useState(true);

  const loadAssetsOnMount = useEffectEvent(async () => {
    await loadAssets();
  });

  const syncAlerts = useEffectEvent(async () => {
    await loadAlerts({
      keyword: keyword || undefined,
      severity,
      status,
      databaseId,
      serverId,
      openOnly,
      skipCount: 0,
      maxResultCount: 50,
    });
  });

  useEffect(() => {
    void loadAssetsOnMount();
  }, []);

  useEffect(() => {
    void syncAlerts();
  }, [databaseId, keyword, openOnly, serverId, severity, status]);

  const resolvedAlerts = toArray(alerts);
  const resolvedServers = toArray(monitoredServers);
  const resolvedDatabases = toArray(monitoredDatabases);

  const alertSummary = useMemo(
    () => ({
      critical: resolvedAlerts.filter((item) => item.severity === 4).length,
      unreviewed: resolvedAlerts.filter((item) => item.status === 0).length,
      inProgress: resolvedAlerts.filter((item) => item.status === 3).length,
    }),
    [resolvedAlerts],
  );

  return (
    <AppShell
      title="Security Alerts"
      subtitle="Queue, filter, and triage suspicious activity flagged by deterministic DataSentinel rules."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Visible alerts</span>
          <span className={styles.statValue}>{resolvedAlerts.length}</span>
          <span className={styles.statHint}>Filtered queue size for the current workspace.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Critical</span>
          <span className={styles.statValue}>{alertSummary.critical}</span>
          <span className={styles.statHint}>Highest-risk incidents that should be handled first.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Unreviewed</span>
          <span className={styles.statValue}>{alertSummary.unreviewed}</span>
          <span className={styles.statHint}>Items still awaiting analyst acknowledgement.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>In progress</span>
          <span className={styles.statValue}>{alertSummary.inProgress}</span>
          <span className={styles.statHint}>Incidents already picked up for investigation.</span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Incident queue
        </Title>
        <Paragraph className={styles.sectionLead}>
          Filters align to the design package’s incident queue flow: narrow by severity, status, actor, and monitored asset, then drill into the detail record.
        </Paragraph>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <Input
            placeholder="Search alert, actor, or rule"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            allowClear
            placeholder="Severity"
            value={severity}
            onChange={(value) => setSeverity(value)}
            options={ALERT_SEVERITY_OPTIONS.map((item) => ({ ...item }))}
          />
          <Select
            allowClear
            placeholder="Status"
            value={status}
            onChange={(value) => setStatus(value)}
            options={ALERT_STATUS_OPTIONS.map((item) => ({ ...item }))}
          />
          <Select
            allowClear
            placeholder="Server"
            value={serverId}
            onChange={(value) => setServerId(value)}
            options={resolvedServers.map((server) => ({
              label: server.name,
              value: server.id,
            }))}
          />
          <Select
            allowClear
            placeholder="Database"
            value={databaseId}
            onChange={(value) => setDatabaseId(value)}
            options={resolvedDatabases.map((database) => ({
              label: database.name,
              value: database.id,
            }))}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Switch checked={openOnly} onChange={setOpenOnly} />
            <span>Open only</span>
          </div>
        </div>

        <QueryState
          isLoading={isAlertsPending}
          errorMessage={errorMessage}
          isEmpty={!resolvedAlerts.length}
          emptyDescription="No alerts match the current filters."
        >
          <Table<ISecurityAlertListItem>
            rowKey="id"
            pagination={false}
            dataSource={resolvedAlerts}
            className={styles.table}
            columns={[
              {
                title: "Severity",
                dataIndex: "severity",
                key: "severity",
                render: (value: number) => <SeverityTag severity={value} />,
              },
              {
                title: "Alert",
                key: "title",
                render: (_, record) => (
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{record.title}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {record.ruleName} • {record.summary}
                    </div>
                  </div>
                ),
              },
              {
                title: "Actor",
                key: "actor",
                render: (_, record) => (
                  <div>
                    <div>{record.primaryActorUser || "Unknown user"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {record.primaryActorIp || "No IP captured"}
                    </div>
                  </div>
                ),
              },
              {
                title: "Window",
                key: "window",
                render: (_, record) => (
                  <div>
                    <div>{formatDateTime(record.eventTimeStart)}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      to {formatDateTime(record.eventTimeEnd)}
                    </div>
                  </div>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (value: number) => <StatusTag status={value} />,
              },
              {
                title: "Events",
                dataIndex: "relatedEventCount",
                key: "relatedEventCount",
              },
              {
                title: "Details",
                key: "details",
                render: (_, record) => (
                  <Link href={`/datasentinel/alerts/${record.id}`}>
                    <Button type="link">Investigate</Button>
                  </Link>
                ),
              },
            ]}
          />
        </QueryState>
      </Card>
    </AppShell>
  );
};

export default withAuth(AlertsPageContent, PERMISSIONS.datasentinelAlertsView);
