"use client";

import { Card, Empty, Progress, Tag, Tooltip, Typography } from "antd";
import { useDashboardState } from "@/providers/dashboardProvider";
import {
  resolveAlertSeverityColor,
  resolveAlertSeverityLabel,
} from "@/utils/datasentinel/activityHelpers";
import { useStyles } from "./style/style";

const TREND_COLORS = {
  reads: "#2563eb",
  writes: "#7c3aed",
  failed: "#dc2626",
  alerts: "#ea580c",
} as const;

const formatBucketLabel = (value: string) =>
  new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TrendBars = ({
  title,
  tone,
  data,
}: {
  title: string;
  tone: keyof typeof TREND_COLORS;
  data: Array<{ bucketStartUtc: string; count: number }>;
}) => {
  const { styles } = useStyles();
  const maxCount = Math.max(...data.map((item) => item.count), 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>{title}</span>
        <span className={styles.chartMeta}>
          Peak {maxCount} event{maxCount === 1 ? "" : "s"}
        </span>
      </div>

      {data.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No trend data" />
      ) : (
        <div className={styles.chartColumns}>
          {data.map((item) => {
            const height = maxCount > 0 ? Math.max((item.count / maxCount) * 160, 12) : 12;

            return (
              <Tooltip
                key={`${title}-${item.bucketStartUtc}`}
                title={`${formatBucketLabel(item.bucketStartUtc)}: ${item.count}`}
              >
                <div className={styles.chartColumnWrap}>
                  <div
                    className={styles.chartColumn}
                    style={{
                      height,
                      background: TREND_COLORS[tone],
                      opacity: item.count > 0 ? 1 : 0.2,
                    }}
                  />
                  <span className={styles.chartLabel}>
                    {new Date(item.bucketStartUtc).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DashboardCharts = () => {
  const { styles } = useStyles();
  const { activityTrends, severityBreakdown } = useDashboardState();
  const severityMax = Math.max(
    ...severityBreakdown.items.map((item) => item.count),
    0,
  );

  return (
    <div className={styles.splitGrid}>
      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Activity and Alert Trends
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Reads, writes, failed access attempts, and alert activity over the
          selected dashboard window.
        </Typography.Paragraph>

        <div className={styles.trendGrid}>
          <TrendBars title="Read activity" tone="reads" data={activityTrends.reads} />
          <TrendBars title="Write activity" tone="writes" data={activityTrends.writes} />
          <TrendBars
            title="Failed access"
            tone="failed"
            data={activityTrends.failedAccess}
          />
          <TrendBars title="Alerts" tone="alerts" data={activityTrends.alerts} />
        </div>
      </Card>

      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Alerts by Severity
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Severity distribution for alerts raised in the active time window.
        </Typography.Paragraph>

        {severityBreakdown.items.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No alerts in range" />
        ) : (
          <div className={styles.severityList}>
            {severityBreakdown.items.map((item) => (
              <div
                key={`${item.severity}-${item.count}`}
                className={styles.severityRow}
              >
                <Tag color={resolveAlertSeverityColor(item.severity)}>
                  {resolveAlertSeverityLabel(item.severity)}
                </Tag>
                <Progress
                  percent={
                    severityMax > 0 ? Math.round((item.count / severityMax) * 100) : 0
                  }
                  strokeColor={item.count > 0 ? undefined : "#cbd5e1"}
                  showInfo={false}
                />
                <span className={styles.severityCount}>{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardCharts;
