"use client";

import Link from "next/link";
import { Button, Card, Empty, Progress, Tabs, Timeline, Typography } from "antd";
import { useDashboardState } from "@/providers/dashboardProvider";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const resolveRiskTone = (score: number) => {
  if (score >= 80) {
    return "#dc2626";
  }

  if (score >= 60) {
    return "#ea580c";
  }

  return "#2563eb";
};

const DashboardRiskPanels = () => {
  const { styles } = useStyles();
  const { anomalyTimeline, canAccessAlerts, topRisk } = useDashboardState();
  const timelineItems = [...anomalyTimeline.items]
    .sort(
      (left, right) =>
        new Date(right.bucketStartUtc).getTime() -
        new Date(left.bucketStartUtc).getTime(),
    )
    .slice(0, 8);

  return (
    <div className={styles.threeColumnGrid}>
      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Top Risky Users
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Highest-scoring actors pulled from the tenant risk profile model.
        </Typography.Paragraph>

        {topRisk.users.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No risky users yet" />
        ) : (
          <div className={styles.riskList}>
            {topRisk.users.map((user) => (
              <div key={`${user.actorUser}-${user.actorIp}`} className={styles.riskItem}>
                <div className={styles.riskHeader}>
                  <span className={styles.riskName}>{user.actorUser || "Unknown actor"}</span>
                  <span style={{ color: resolveRiskTone(user.riskScore), fontWeight: 700 }}>
                    {user.riskScore}
                  </span>
                </div>
                <Progress
                  percent={Math.max(0, Math.min(100, user.riskScore))}
                  strokeColor={resolveRiskTone(user.riskScore)}
                  showInfo={false}
                  size="small"
                />
                <div className={styles.riskMeta}>
                  {user.alertCount} alert(s), {user.failedLoginCount} failed login(s),{" "}
                  {user.highSeverityAlertCount} high severity incident(s)
                </div>
                <div className={styles.riskMeta}>
                  IP: {user.actorIp || "Not captured"} | Last evaluated{" "}
                  {formatDateTime(user.lastEvaluatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Risky Entities
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Databases and tables with the heaviest alert concentration.
        </Typography.Paragraph>

        <Tabs
          items={[
            {
              key: "databases",
              label: "Databases",
              children:
                topRisk.databases.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No risky databases yet"
                  />
                ) : (
                  topRisk.databases.map((entity) => (
                    <div key={`db-${entity.entityId ?? entity.name}`} className={styles.entityRow}>
                      <div>
                        <div className={styles.entityTitle}>{entity.name}</div>
                        <div className={styles.entityMeta}>
                          {entity.alertCount} alert(s) | {entity.highSeverityAlertCount} high severity
                        </div>
                      </div>
                      <div className={styles.entityMeta}>
                        {formatDateTime(entity.lastAlertAtUtc)}
                      </div>
                    </div>
                  ))
                ),
            },
            {
              key: "tables",
              label: "Tables",
              children:
                topRisk.tables.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No risky tables yet"
                  />
                ) : (
                  topRisk.tables.map((entity) => (
                    <div
                      key={`table-${entity.entityId ?? entity.name}`}
                      className={styles.entityRow}
                    >
                      <div>
                        <div className={styles.entityTitle}>{entity.name}</div>
                        <div className={styles.entityMeta}>
                          {entity.alertCount} alert(s) | {entity.highSeverityAlertCount} high severity
                        </div>
                      </div>
                      <div className={styles.entityMeta}>
                        {formatDateTime(entity.lastAlertAtUtc)}
                      </div>
                    </div>
                  ))
                ),
            },
          ]}
        />
      </Card>

      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Anomaly Timeline
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Most recent suspicious buckets, ordered newest first for fast triage.
        </Typography.Paragraph>

        {timelineItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No anomalies in the selected window"
          />
        ) : (
          <Timeline
            items={timelineItems.map((item) => ({
              color:
                item.highSeverityAlertCount > 0
                  ? "red"
                  : item.alertCount > 0
                    ? "orange"
                    : "blue",
              content: (
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {formatDateTime(item.bucketStartUtc)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span className={styles.timelineMetric}>
                      Suspicious events: {item.suspiciousEventCount}
                    </span>
                    <span className={styles.timelineMetric}>
                      Alerts: {item.alertCount}
                    </span>
                    <span className={styles.timelineMetric}>
                      High severity: {item.highSeverityAlertCount}
                    </span>
                  </div>
                </div>
              ),
            }))}
          />
        )}

        {canAccessAlerts ? (
          <div style={{ marginTop: 16 }}>
            <Link href="/datasentinel/alerts">
              <Button type="primary">Investigate alerts</Button>
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default DashboardRiskPanels;
