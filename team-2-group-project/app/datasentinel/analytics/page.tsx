"use client";

import Link from "next/link";
import { useEffect, useEffectEvent } from "react";
import { Card, Table, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import SeverityTag from "@/components/datasentinel/SeverityTag";
import StatusTag from "@/components/datasentinel/StatusTag";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { toArray } from "@/utils/helpers";

const { Title } = Typography;

const AnalyticsPageContent = () => {
  const { styles } = useStyles();
  const { dashboardOverview: overview, isDashboardPending, errorMessage } =
    useDataSentinelState();
  const { loadDashboard } = useDataSentinelActions();

  const loadAnalyticsDashboard = useEffectEvent(async () => {
    await loadDashboard({ windowDays: 14 });
  });

  useEffect(() => {
    void loadAnalyticsDashboard();
  }, []);

  return (
    <AppShell
      title="Security Analytics"
      subtitle="Trend-focused analytics for operations managers and analysts reviewing incident patterns over time."
    >
      <QueryState
        isLoading={isDashboardPending}
        errorMessage={errorMessage}
        isEmpty={!overview}
        emptyDescription="Analytics will appear after demo data is generated or imported."
      >
        {overview ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Active alerts</span>
                <span className={styles.statValue}>{overview.activeAlertCount}</span>
                <span className={styles.statHint}>Current queue across all severities.</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Large reads</span>
                <span className={styles.statValue}>{overview.largeReadEventCount}</span>
                <span className={styles.statHint}>High-volume read or export events in the last day.</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Failed logins</span>
                <span className={styles.statValue}>{overview.failedLoginCount}</span>
                <span className={styles.statHint}>Failed access attempts captured in the last 24 hours.</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Enabled rules</span>
                <span className={styles.statValue}>{overview.enabledRuleCount}</span>
                <span className={styles.statHint}>Deterministic detectors currently active.</span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: 16,
              }}
            >
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Severity distribution
                </Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {toArray(overview.alertsBySeverity).map((item) => (
                    <div
                      key={`severity-${item.severity}`}
                      style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                    >
                      <SeverityTag severity={item.severity} />
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Workflow status mix
                </Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {toArray(overview.alertsByStatus).map((item) => (
                    <div
                      key={`status-${item.status}`}
                      style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                    >
                      <StatusTag status={item.status} />
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className={styles.pageCard}>
              <Title level={4} className={styles.sectionTitle}>
                Top risk actors
              </Title>
              <Table
                rowKey="actorUser"
                pagination={false}
                dataSource={toArray(overview.topRiskActors)}
                className={styles.table}
                columns={[
                  {
                    title: "Actor",
                    dataIndex: "actorUser",
                    key: "actorUser",
                  },
                  {
                    title: "Indicator",
                    dataIndex: "topIndicator",
                    key: "topIndicator",
                  },
                  {
                    title: "Risk score",
                    dataIndex: "riskScore",
                    key: "riskScore",
                  },
                  {
                    title: "Alerts",
                    dataIndex: "alertCount",
                    key: "alertCount",
                  },
                  {
                    title: "Events",
                    dataIndex: "eventCount",
                    key: "eventCount",
                  },
                ]}
              />
            </Card>

            <Card className={styles.pageCard}>
              <Title level={4} className={styles.sectionTitle}>
                Recent alerts for reporting
              </Title>
              <Table
                rowKey="id"
                pagination={false}
                dataSource={toArray(overview.recentAlerts)}
                className={styles.table}
                columns={[
                  {
                    title: "Alert",
                    key: "title",
                    render: (_, record) => (
                      <div>
                        <div style={{ fontWeight: 700 }}>{record.title}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          {record.ruleName} • {record.actorUser}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Severity",
                    dataIndex: "severity",
                    key: "severity",
                    render: (value: number) => <SeverityTag severity={value} />,
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (value: number) => <StatusTag status={value} />,
                  },
                  {
                    title: "Open",
                    key: "open",
                    render: (_, record) => (
                      <Link href={`/datasentinel/alerts/${record.id}`}>View alert</Link>
                    ),
                  },
                ]}
              />
            </Card>
          </>
        ) : null}
      </QueryState>
    </AppShell>
  );
};

export default withAuth(AnalyticsPageContent, PERMISSIONS.datasentinelAnalytics);
