"use client";

import { Card, Typography } from "antd";
import { useReportExportState } from "@/providers/reportExportProvider";
import { useStyles } from "./style/style";

const ReportExportSummary = () => {
  const { styles } = useStyles();
  const { activityEvents, alerts, windowDays } = useReportExportState();

  const failedOperations = activityEvents.filter((event) => !event.isSuccess).length;
  const distinctDatabases = new Set(
    activityEvents
      .map((event) => event.databaseName)
      .filter((value): value is string => Boolean(value)),
  ).size;
  const reviewedAlerts = alerts.filter((alert) => alert.status !== 0).length;

  const items = [
    {
      label: "Alert rows",
      value: alerts.length,
      hint: `Alert register rows available for the last ${windowDays} day(s).`,
    },
    {
      label: "Activity rows",
      value: activityEvents.length,
      hint: "Activity register rows included in export source data.",
    },
    {
      label: "Failed operations",
      value: failedOperations,
      hint: "Unsuccessful activity rows captured in the export window.",
    },
    {
      label: "Reviewed alerts",
      value: reviewedAlerts,
      hint: `${distinctDatabases} distinct database(s) represented in the sampled activity.`,
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Export Summary
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Quick confirmation of what will be included before you export.
      </Typography.Paragraph>

      <div className={styles.statGrid}>
        {items.map((item) => (
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

export default ReportExportSummary;
