"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ALERT_REVIEW_STATUS_OPTIONS } from "@/constants/datasentinel/alerts";
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
  const router = useRouter();
  const {
    alerts,
    canReviewAlerts,
    currentPage,
    errorMessage,
    isBulkUpdatingStatus,
    isLoading,
    pageSize,
    selectedAlertIds,
    totalCount,
  } = useSecurityAlertsState();
  const {
    bulkUpdateStatus,
    setPagination,
    setSelectedAlertIds,
  } = useSecurityAlertsActions();
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm] = Form.useForm();

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

        {canReviewAlerts ? (
          <div className={styles.bulkToolbar}>
            <Paragraph className={styles.selectionSummary}>
              {selectedAlertIds.length > 0
                ? `${selectedAlertIds.length} new alert${selectedAlertIds.length === 1 ? "" : "s"} selected`
                : "Select new alerts to bulk resolve or dismiss them."}
            </Paragraph>
            <Space wrap>
              <Button
                icon={<CheckCircleOutlined />}
                disabled={selectedAlertIds.length === 0}
                onClick={() => {
                  bulkForm.setFieldsValue({ newStatus: 3, comment: "" });
                  setBulkModalOpen(true);
                }}
              >
                Resolve selected
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                disabled={selectedAlertIds.length === 0}
                onClick={() => {
                  bulkForm.setFieldsValue({ newStatus: 4, comment: "" });
                  setBulkModalOpen(true);
                }}
              >
                Dismiss selected
              </Button>
            </Space>
          </div>
        ) : null}
      </div>

      <Table<ISecurityAlertListItem>
        rowKey="id"
        loading={isLoading}
        dataSource={alerts}
        className={styles.table}
        scroll={{ x: 1280 }}
        rowSelection={
          canReviewAlerts
            ? {
                selectedRowKeys: selectedAlertIds,
                onChange: (keys) => setSelectedAlertIds(keys.map(String)),
                getCheckboxProps: (record) => ({
                  disabled: record.status !== 0,
                }),
              }
            : undefined
        }
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
                  {record.serverName || "Server not linked"}
                  {record.databaseName ? ` | ${record.databaseName}` : ""}
                  {record.tableName ? ` | ${record.tableName}` : ""}
                  {record.primaryActorUser ? ` | ${record.primaryActorUser}` : ""}
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
                onClick={() => {
                  router.push(`/datasentinel/alerts/${record.id}`);
                }}
              >
                View
              </Button>
            ),
          },
        ]}
      />

      <Modal
        title="Bulk review selected alerts"
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        onOk={() => {
          void bulkForm.submit();
        }}
        okButtonProps={{ loading: isBulkUpdatingStatus }}
        okText="Apply bulk action"
        destroyOnClose
      >
        <Form
          form={bulkForm}
          layout="vertical"
          onFinish={async (values) => {
            const updated = await bulkUpdateStatus({
              alertIds: selectedAlertIds,
              newStatus: values.newStatus,
              comment: values.comment,
            });

            if (updated) {
              setBulkModalOpen(false);
              bulkForm.resetFields();
            }
          }}
        >
          <Form.Item
            name="newStatus"
            label="Target status"
            rules={[{ required: true, message: "Choose how to handle these alerts." }]}
          >
            <Select
              options={ALERT_REVIEW_STATUS_OPTIONS.filter(
                (option) => option.value === 3 || option.value === 4,
              ).map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </Form.Item>
          <Form.Item name="comment" label="Investigation note">
            <Input.TextArea
              rows={4}
              placeholder="Explain why these alerts are being resolved or dismissed..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SecurityAlertsTable;
