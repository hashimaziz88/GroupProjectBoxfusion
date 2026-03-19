"use client";

import Link from "next/link";
import { Button, Card, Typography } from "antd";
import { useDashboardState } from "@/providers/dashboardProvider";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const DashboardOverview = () => {
  const { styles } = useStyles();
  const {
    summary,
    appliedFilters,
    canAccessActivity,
    canAccessAlerts,
    canAccessInfrastructure,
  } = useDashboardState();

  const summaryCards = [
    {
      label: "Total alerts",
      value: summary.totalAlerts,
      hint: `${summary.criticalAlerts} critical in the last ${appliedFilters.windowDays} day(s).`,
    },
    {
      label: "New alerts",
      value: summary.newAlerts,
      hint: "Fresh incidents that still need analyst attention.",
    },
    {
      label: "Failed access attempts",
      value: summary.totalFailedAccessAttempts,
      hint: "Authentication or authorization failures across monitored activity.",
    },
    {
      label: "Suspicious writes",
      value: summary.suspiciousWriteActivityCount,
      hint: "Writes marked high severity, failed, or out of hours.",
    },
    {
      label: "High-risk users",
      value: summary.highRiskUsersCount,
      hint: "Actors with elevated user risk profiles.",
    },
    {
      label: "Window end",
      value: summary.windowEndUtc ? formatDateTime(summary.windowEndUtc) : "Now",
      hint: `View spans from ${formatDateTime(summary.windowStartUtc)}.`,
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Security Overview
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        A tenant-scoped snapshot of current alert volume, failed access pressure,
        and the riskiest monitored behavior.
      </Typography.Paragraph>

      <div className={styles.quickLinks}>
        {canAccessAlerts ? (
          <Link href="/datasentinel/alerts">
            <Button type="primary">Open alerts queue</Button>
          </Link>
        ) : null}
        {canAccessActivity ? (
          <Link href="/datasentinel/activity">
            <Button>Inspect activity events</Button>
          </Link>
        ) : null}
        {canAccessInfrastructure ? (
          <Link href="/datasentinel/infrastructure">
            <Button>Review infrastructure</Button>
          </Link>
        ) : null}
      </div>

      <div className={styles.statGrid} style={{ marginTop: 18 }}>
        {summaryCards.map((item) => (
          <div key={item.label} className={styles.statCard}>
            <span className={styles.statLabel}>{item.label}</span>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statHint}>{item.hint}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DashboardOverview;
