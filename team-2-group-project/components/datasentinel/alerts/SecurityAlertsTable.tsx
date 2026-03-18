"use client";

import { Button, Card, Empty, Table, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { ISecurityAlertListItem } from "@/interfaces/datasentinel/alerts";
import {
  useSecurityAlertsActions,
  useSecurityAlertsState,
} from "@/providers/securityAlertsProvider";
import {
  resolveAlertSeverityColor,
  resolveAlertSeverityLabel,
  resolveAlertStatusColor,
  resolveAlertStatusLabel,
} from "@/utils/datasentinel/activityHelpers";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const { Paragraph, Title } = Typography;

const resolveRiskColor = (score: number) => {
  if (score >= 85) return "red";
  if (score >= 65) return "volcano";
  if (score >= 45) return "gold";
  return "blue";
};

const SecurityAlertsTable = () => {
  const { styles } = useStyles();
  const {
    alerts,
    currentPage,
    errorMessage,
    isLoading,
    pageSize,
    totalCount,
  } = useSecurityAlertsState();
  const { openAlert, setPagination } = useSecurityAlertsActions();

  return (
    <Card className={styles.pageCard}>
      <div className={styles.tableToolbar}>
        <div>
          <Title level={4} className={styles.sectionTitle}>
            Alert queue
          </Title>
          <Paragraph className={styles.sectionLead}>
            Showing {totalCount} matching alert{totalCount === 1 ? "" : "s"} for the current tenant.
          </Paragraph>
        </div>
      </div>

      <Table<ISecurityAlertListItem>
        rowKey="id"
        loading={isLoading}
        dataSource={alerts}
        className={styles.table}
        scroll={{ x: 1180 }}
        locale={{
          emptyText: (
            <Empty
              description={
                errorMessage
                  ? "The security alert queue could not be loaded."
                  : "No alerts matched the current filters."
              }
            />
          ),
        }}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalCount,
          showSizeChanger: true,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        onChange={(pagination) => {
          void setPagination(pagination.current ?? 1, pagination.pageSize ?? 25);
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "alertId",
            key: "alertId",
            width: 150,
            render: (value: string) => <code>{value}</code>,
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
            title: "Alert details",
            key: "details",
            render: (_, record) => (
              <>
                <strong>{record.title}</strong>
                <div className={styles.cellHint}>{record.summary}</div>
                <div className={styles.cellHint}>
                  {record.databaseName || "Database not linked"}
                  {record.tableName ? ` • ${record.tableName}` : ""}
                  {record.primaryActorUser ? ` • ${record.primaryActorUser}` : ""}
                </div>
              </>
            ),
          },
          {
            title: "Risk score",
            dataIndex: "riskScore",
            key: "riskScore",
            width: 110,
            render: (value: number) => (
              <Tag color={resolveRiskColor(value)} className={styles.riskBadge}>
                {value}
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
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 140,
            render: (value: number) => (
              <Tag color={resolveAlertStatusColor(value)}>
                {resolveAlertStatusLabel(value)}
              </Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            width: 110,
            render: (_, record) => (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => void openAlert(record.id)}
              >
                View
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
};

export default SecurityAlertsTable;
