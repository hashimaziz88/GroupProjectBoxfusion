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

const { Paragraph, Title } = Typography;

const HomePageContent = () => {
  const { styles } = useStyles();
  const { dashboardOverview: overview, isDashboardPending, errorMessage } =
    useDataSentinelState();
  const { loadDashboard } = useDataSentinelActions();

  const loadHomeDashboard = useEffectEvent(async () => {
    await loadDashboard({ windowDays: 7 });
  });

  useEffect(() => {
    void loadHomeDashboard();
  }, []);

  return (
    <AppShell
      title="Security Dashboard"
      subtitle="Live DataSentinel monitoring across alerts, anomalous activity, risky actors, and monitored database scope."
    >
      <QueryState
        isLoading={isDashboardPending}
        errorMessage={errorMessage}
        isEmpty={!overview}
        emptyDescription="No dashboard data is available yet. Generate demo activity to populate the workspace."
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
                <span className={styles.statHint}>
                  {overview.criticalAlertCount} critical incidents need priority review.
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Events in 24h</span>
                <span className={styles.statValue}>{overview.totalEventCount}</span>
                <span className={styles.statHint}>
                  {overview.failedLoginCount} failed logins and {overview.privilegedActionCount} privileged actions.
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Investigation queue</span>
                <span className={styles.statValue}>{overview.inProgressAlertCount}</span>
                <span className={styles.statHint}>
                  {overview.resolvedTodayCount} alerts resolved today by analysts.
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Monitored assets</span>
                <span className={styles.statValue}>{overview.monitoredDatabaseCount}</span>
                <span className={styles.statHint}>
                  {overview.monitoredServerCount} servers and {overview.enabledRuleCount} enabled rules.
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
                gap: 16,
              }}
            >
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Anomalies over time
                </Title>
                <Paragraph className={styles.sectionLead}>
                  Daily alert volume for the last seven days, matching the Figma dashboard’s trend-first hierarchy.
                </Paragraph>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))",
                    gap: 12,
                    alignItems: "end",
                    minHeight: 180,
                  }}
                >
                  {toArray(overview.anomalyTrend).map((point) => {
                    const barHeight = Math.max(18, point.count * 12);
                    return (
                      <div
                        key={point.label}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          alignItems: "stretch",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "flex-end",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: barHeight,
                              borderRadius: 18,
                              background:
                                "linear-gradient(180deg, rgba(31,111,235,0.92) 0%, rgba(50,81,168,0.68) 100%)",
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{point.count}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{point.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Alert severity mix
                </Title>
                <Paragraph className={styles.sectionLead}>
                  Current queue composition by severity and workflow status.
                </Paragraph>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {toArray(overview.alertsBySeverity).map((item) => (
                    <div
                      key={`severity-${item.severity}`}
                      style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                    >
                      <SeverityTag severity={item.severity} />
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 4, paddingTop: 14 }}>
                    {toArray(overview.alertsByStatus).map((item) => (
                      <div
                        key={`status-${item.status}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        <StatusTag status={item.status} />
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                gap: 16,
              }}
            >
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Recent alert queue
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
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{record.title}</div>
                          <div style={{ color: "#64748b", fontSize: 13 }}>
                            {record.ruleName} • {record.actorUser || "Unknown actor"}
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
                        <Link href={`/datasentinel/alerts/${record.id}`}>Investigate</Link>
                      ),
                    },
                  ]}
                />
              </Card>

              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Top risky actors
                </Title>
                <Paragraph className={styles.sectionLead}>
                  Actors bubble up here when alerts, failed access, and privileged actions overlap.
                </Paragraph>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {toArray(overview.topRiskActors).map((actor) => (
                    <div
                      key={actor.actorUser}
                      style={{
                        padding: 16,
                        borderRadius: 18,
                        background: "linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%)",
                        border: "1px solid #d8e4f3",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{actor.actorUser}</div>
                          <div style={{ color: "#64748b", fontSize: 13 }}>
                            {actor.topIndicator || "Escalated from combined indicators"}
                          </div>
                        </div>
                        <div
                          style={{
                            minWidth: 56,
                            textAlign: "center",
                            padding: "8px 10px",
                            borderRadius: 14,
                            background: "#eef4ff",
                            color: "#214a84",
                            fontWeight: 700,
                          }}
                        >
                          {actor.riskScore}
                        </div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
                        {actor.alertCount} alerts • {actor.eventCount} recent events
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className={styles.pageCard}>
              <Title level={4} className={styles.sectionTitle}>
                Activity pulse
              </Title>
              <Paragraph className={styles.sectionLead}>
                Read, write, and failed login pressure over the last 24 hours.
              </Paragraph>
              <Table
                rowKey="label"
                pagination={false}
                dataSource={toArray(overview.activitySeries)}
                className={styles.table}
                columns={[
                  {
                    title: "Time",
                    dataIndex: "label",
                    key: "label",
                  },
                  {
                    title: "Reads",
                    dataIndex: "reads",
                    key: "reads",
                  },
                  {
                    title: "Writes",
                    dataIndex: "writes",
                    key: "writes",
                  },
                  {
                    title: "Failed logins",
                    dataIndex: "failedLogins",
                    key: "failedLogins",
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

export default withAuth(HomePageContent, PERMISSIONS.datasentinelDashboard);
