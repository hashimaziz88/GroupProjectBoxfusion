"use client";

import Link from "next/link";
import { Button, Card, Empty, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";
import { useDashboardState } from "@/providers/dashboardProvider";
import {
  resolveAlertSeverityColor,
  resolveAlertSeverityLabel,
  resolveAlertStatusColor,
  resolveAlertStatusLabel,
} from "@/utils/datasentinel/activityHelpers";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const columns: ColumnsType<ISecurityAlertListItem> = [
  {
    title: "Alert",
    dataIndex: "title",
    key: "title",
    render: (title: string, record) => (
      <div>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{title}</div>
        <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
          {record.databaseName || "Database not linked"} |{" "}
          {record.primaryActorUser || "Unknown actor"}
        </div>
      </div>
    ),
  },
  {
    title: "Severity",
    dataIndex: "severity",
    key: "severity",
    width: 120,
    render: (severity: number | string) => (
      <Tag color={resolveAlertSeverityColor(severity)}>
        {resolveAlertSeverityLabel(severity)}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 140,
    render: (status: number | string) => (
      <Tag color={resolveAlertStatusColor(status)}>
        {resolveAlertStatusLabel(status)}
      </Tag>
    ),
  },
  {
    title: "Triggered",
    dataIndex: "triggeredAt",
    key: "triggeredAt",
    width: 200,
    render: (value: string) => formatDateTime(value),
  },
];

const DashboardRecentAlerts = () => {
  const { styles } = useStyles();
  const { canAccessAlerts, recentAlerts } = useDashboardState();

  return (
    <Card
      className={styles.pageCard}
      extra={
        canAccessAlerts ? (
          <Link href="/datasentinel/alerts">
            <Button type="primary">View all alerts</Button>
          </Link>
        ) : null
      }
    >
      <Typography.Title level={4} className={styles.sectionTitle}>
        Recent Alert Highlights
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        A short queue of the latest incidents to help analysts move from overview
        to investigation.
      </Typography.Paragraph>

      {recentAlerts.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent alerts" />
      ) : (
        <Table<ISecurityAlertListItem>
          rowKey="id"
          columns={columns}
          dataSource={recentAlerts}
          pagination={false}
          className={styles.table}
        />
      )}
    </Card>
  );
};

export default DashboardRecentAlerts;
