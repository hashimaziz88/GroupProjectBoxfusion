"use client";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Input,
  Select,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { DownloadOutlined, ExclamationCircleOutlined, RobotOutlined } from "@ant-design/icons";
import { ALERT_REVIEW_STATUS_OPTIONS } from "@/constants/datasentinel/alerts";
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
import { IAiAlertAnalysis } from "@/utils/datasentinel/aiService";
import { formatDateTime } from "@/utils/helpers";
import { useStyles } from "./style/style";

const { Paragraph, Text, Title } = Typography;

// ─── AI panel ────────────────────────────────────────────────────────────────

interface AlertAiPanelProps {
  isLoading: boolean;
  error: string | null;
  analysis: IAiAlertAnalysis | null;
  severityLabel: string;
  onRetry: () => void;
}

const AlertAiPanel = ({
  isLoading,
  error,
  analysis,
  severityLabel,
  onRetry,
}: AlertAiPanelProps) => {
  const { styles } = useStyles();

  const renderBody = () => {
    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 3 }} title={false} />;
    }
    if (error) {
      return (
        <div className={styles.aiErrorBlock}>
          <ExclamationCircleOutlined style={{ marginTop: 2 }} />
          <div>
            <Paragraph style={{ margin: 0 }}>{error}</Paragraph>
            <Button size="small" style={{ marginTop: 8 }} onClick={onRetry}>
              Retry
            </Button>
          </div>
        </div>
      );
    }
    if (!analysis) return null;

    return (
      <>
        <div className={styles.aiSection}>
          <span className={styles.aiSectionLabel}>What happened</span>
          <Paragraph style={{ margin: 0 }}>{analysis.summary}</Paragraph>
        </div>

        {analysis.severityRationale ? (
          <div className={styles.aiSection}>
            <span className={styles.aiSectionLabel}>
              Why {severityLabel} severity
            </span>
            <div className={styles.aiSeverityBlock}>
              <Paragraph style={{ margin: 0 }}>{analysis.severityRationale}</Paragraph>
            </div>
          </div>
        ) : null}

        <div className={styles.aiSection}>
          <span className={styles.aiSectionLabel}>Suggested next step</span>
          <div className={styles.aiNextStepBlock}>
            <Paragraph style={{ margin: 0 }}>{analysis.nextStep}</Paragraph>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiPanelHeader}>
        <RobotOutlined style={{ color: "#6366f1", fontSize: 16 }} />
        <Title level={5} className={styles.aiPanelTitle}>
          AI Analysis
        </Title>
      </div>
      {renderBody()}
    </div>
  );
};

// ─── Detail view ──────────────────────────────────────────────────────────────

const resolveNoteAuthor = (
  displayName?: string | null,
  userId?: number | null,
): string => {
  if (displayName) return ` | ${displayName}`;
  if (userId) return ` | User ${userId}`;
  return "";
};

const SecurityAlertDetailView = () => {
  const { styles } = useStyles();
  const {
    aiAnalysis,
    aiError,
    canExportReports,
    canReviewAlerts,
    detailErrorMessage,
    history,
    isAiLoading,
    isCreatingNote,
    isDetailLoading,
    isExportingReport,
    isUpdatingStatus,
    notes,
    selectedAlert,
  } = useSecurityAlertsState();
  const { createNote, exportReport, retryAiAnalysis, updateStatus } =
    useSecurityAlertsActions();

  const [statusForm] = Form.useForm();
  const [noteForm] = Form.useForm();

  const handleExportReport = async () => {
    await exportReport();
  };

  return (
    <Card className={styles.pageCard}>
      {detailErrorMessage ? (
        <Alert type="error" showIcon title={detailErrorMessage} className={styles.alert} />
      ) : null}

      {isDetailLoading ? (
        <Paragraph>Loading alert details...</Paragraph>
      ) : null}

      {!isDetailLoading && !selectedAlert ? (
        <Empty description="The selected alert could not be loaded." />
      ) : null}

      {!isDetailLoading && selectedAlert ? (
        <>
          <div className={styles.detailHero}>
            <Space wrap>
              <Tag color={resolveAlertSeverityColor(selectedAlert.severity)}>
                {resolveAlertSeverityLabel(selectedAlert.severity)}
              </Tag>
              <Tag color={resolveAlertStatusColor(selectedAlert.status)}>
                {resolveAlertStatusLabel(selectedAlert.status)}
              </Tag>
              <Tag className={styles.riskBadge} color="blue">
                Risk score {selectedAlert.riskScore}
              </Tag>
            </Space>

            <div>
              <Title level={4} className={styles.sectionTitle}>
                {selectedAlert.title}
              </Title>
              <Text type="secondary">{selectedAlert.alertId}</Text>
            </div>
          </div>

          <AlertAiPanel
            isLoading={isAiLoading}
            error={aiError}
            analysis={aiAnalysis}
            severityLabel={resolveAlertSeverityLabel(selectedAlert.severity)}
            onRetry={retryAiAnalysis}
          />

          <div className={styles.detailSection}>
            <Title level={5} className={styles.sectionTitle}>
              Summary
            </Title>
            <Paragraph>{selectedAlert.summary}</Paragraph>
          </div>

          <div className={styles.detailSection}>
            <Title level={5} className={styles.sectionTitle}>
              Event context
            </Title>
            <div className={styles.detailGrid}>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Triggered</span>
                <strong>{formatDateTime(selectedAlert.triggeredAt)}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Actor</span>
                <strong>{selectedAlert.primaryActorUser || "Unknown actor"}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Actor IP</span>
                <strong>{selectedAlert.primaryActorIp || "IP not captured"}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Server</span>
                <strong>{selectedAlert.serverName || "Server not linked"}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Database</span>
                <strong>{selectedAlert.databaseName || "Database not linked"}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Table</span>
                <strong>{selectedAlert.tableName || "Table not linked"}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Event window start</span>
                <strong>{formatDateTime(selectedAlert.eventTimeStart)}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Event window end</span>
                <strong>{formatDateTime(selectedAlert.eventTimeEnd)}</strong>
              </div>
              <div className={styles.detailMetric}>
                <span className={styles.metricLabel}>Related events</span>
                <strong>{selectedAlert.relatedEventCount}</strong>
              </div>
            </div>
          </div>


          <div className={styles.detailSection}>
            <Title level={5} className={styles.sectionTitle}>
              Status history
            </Title>
            {history.length > 0 ? (
              <Timeline
                items={history.map((item) => ({
                  color: resolveAlertStatusColor(item.toStatus),
                  content: (
                    <>
                      <strong>
                        {resolveAlertStatusLabel(item.fromStatus)} to{" "}
                        {resolveAlertStatusLabel(item.toStatus)}
                      </strong>
                      <div className={styles.cellHint}>
                        {item.creatorUserDisplayName || "System"} |{" "}
                        {formatDateTime(item.creationTime)}
                      </div>
                      {item.comment ? <div>{item.comment}</div> : null}
                    </>
                  ),
                }))}
              />
            ) : (
              <Paragraph type="secondary">
                No status changes have been recorded yet.
              </Paragraph>
            )}
          </div>

          <div className={styles.detailSection}>
            <Title level={5} className={styles.sectionTitle}>
              Incident notes
            </Title>
            {notes.length > 0 ? (
              <div className={styles.noteList}>
                {notes.map((note) => {
                  const author = resolveNoteAuthor(
                    note.creatorUserDisplayName,
                    note.creatorUserId,
                  );
                  return (
                    <div key={note.id} className={styles.noteCard}>
                      <div className={styles.noteMeta}>
                        {formatDateTime(note.creationTime)}
                        {author}
                        {note.isInternal ? " | Internal" : ""}
                      </div>
                      <div>{note.body}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Paragraph type="secondary">
                No incident notes have been added yet.
              </Paragraph>
            )}
          </div>

          {canReviewAlerts ? (
            <>
              <div className={styles.detailSection}>
                <Title level={5} className={styles.sectionTitle}>
                  Update status
                </Title>
                <Form
                  form={statusForm}
                  layout="vertical"
                  onFinish={async (values) => {
                    const updated = await updateStatus(values);
                    if (updated) {
                      statusForm.resetFields();
                    }
                  }}
                >
                  <Form.Item
                    name="newStatus"
                    label="New status"
                    rules={[{ required: true, message: "Choose a status." }]}
                  >
                    <Select
                      options={ALERT_REVIEW_STATUS_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="comment" label="Comment">
                    <Input.TextArea rows={3} placeholder="Add investigation context..." />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={isUpdatingStatus}>
                    Update status
                  </Button>
                </Form>
              </div>

              <div className={styles.detailSection}>
                <Title level={5} className={styles.sectionTitle}>
                  Add note
                </Title>
                <Form
                  form={noteForm}
                  layout="vertical"
                  initialValues={{ isInternal: false }}
                  onFinish={async (values) => {
                    const created = await createNote(values);
                    if (created) {
                      noteForm.resetFields();
                      noteForm.setFieldValue("isInternal", false);
                    }
                  }}
                >
                  <Form.Item
                    name="body"
                    label="Note"
                    rules={[{ required: true, message: "Enter a note." }]}
                  >
                    <Input.TextArea rows={4} placeholder="Capture what you found..." />
                  </Form.Item>
                  <Form.Item name="isInternal" valuePropName="checked">
                    <Checkbox>Internal note</Checkbox>
                  </Form.Item>
                  <Button htmlType="submit" loading={isCreatingNote}>
                    Add note
                  </Button>
                </Form>
              </div>
            </>
          ) : null}

          {canExportReports ? (
            <div className={styles.drawerActions}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
                loading={isExportingReport}
              >
                Export incident report
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </Card>
  );
};

export default SecurityAlertDetailView;
