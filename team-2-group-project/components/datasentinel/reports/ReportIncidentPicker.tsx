"use client";

import Link from "next/link";
import { Button, Card, Empty, Select, Table, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
  useReportExportActions,
  useReportExportState,
} from "@/providers/reportExportProvider";
import {
  resolveAlertSeverityColor,
  resolveAlertSeverityLabel,
  resolveAlertStatusColor,
  resolveAlertStatusLabel,
} from "@/utils/datasentinel/activityHelpers";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const ReportIncidentPicker = () => {
  const { styles } = useStyles();
  const { alerts, canAccessAlerts, selectedAlertId } = useReportExportState();
  const { setSelectedAlertId } = useReportExportActions();

  if (!canAccessAlerts) {
    return (
      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Incident Report Source
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Incident report selection is available only when the current role can also view security alerts.
        </Typography.Paragraph>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Alert review access is required before incident PDFs can be generated."
        />
      </Card>
    );
  }

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Incident Report Source
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Pick the alert to use when generating a single incident PDF.
      </Typography.Paragraph>

      <div className={styles.controlField} style={{ marginBottom: 16 }}>
        <span>Selected alert</span>
        <Select
          value={selectedAlertId ?? undefined}
          placeholder="Choose an alert"
          options={alerts.map((alert) => ({
            value: alert.id,
            label: `${alert.alertId} | ${alert.title}`,
          }))}
          onChange={(value) => setSelectedAlertId(value)}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={alerts.slice(0, 8)}
        className={styles.table}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No alerts available for PDF export in this window"
            />
          ),
        }}
        columns={[
          {
            title: "Alert",
            key: "alert",
            render: (_, record) => (
              <div>
                <div style={{ fontWeight: 700 }}>{record.title}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>
                  {record.alertId} | {record.databaseName || "Database not linked"}
                </div>
              </div>
            ),
          },
          {
            title: "Severity",
            dataIndex: "severity",
            key: "severity",
            width: 120,
            render: (value: number) => (
              <Tag color={resolveAlertSeverityColor(value)}>
                {resolveAlertSeverityLabel(value)}
              </Tag>
            ),
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (value: number) => (
              <Tag color={resolveAlertStatusColor(value)}>
                {resolveAlertStatusLabel(value)}
              </Tag>
            ),
          },
          {
            title: "Triggered",
            dataIndex: "triggeredAt",
            key: "triggeredAt",
            width: 180,
            render: (value: string) => formatDateTime(value),
          },
          {
            title: "Action",
            key: "action",
            width: 110,
            render: (_, record) =>
              canAccessAlerts ? (
                <Link href={`/datasentinel/alerts/${record.id}`}>
                  <Button type="link" icon={<EyeOutlined />} size="small">
                    Review
                  </Button>
                </Link>
              ) : null,
          },
        ]}
      />
    </Card>
  );
};

export default ReportIncidentPicker;
