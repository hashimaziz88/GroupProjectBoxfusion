"use client";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  List,
  Select,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  MessageOutlined,
  RobotOutlined,
} from "@ant-design/icons";
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

const resolveStatusTone = (status: number) => {
  const label = resolveAlertStatusLabel(status).toLowerCase();

  if (label.includes("new")) return "processing";
  if (label.includes("review")) return "warning";
  if (label.includes("resolve")) return "success";
  if (label.includes("dismiss")) return "default";

  return "processing";
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
            <div className={styles.heroHeadingRow}>
              <div className={styles.heroHeadingBlock}>
                <Space wrap>
                  <Tag
                    className={styles.heroSeverityTag}
                    color={resolveAlertSeverityColor(selectedAlert.severity)}
                  >
                    {resolveAlertSeverityLabel(selectedAlert.severity)}
                  </Tag>
                  <Tag
                    className={styles.heroStatusTag}
                    color={resolveAlertStatusColor(selectedAlert.status)}
                  >
                    {resolveAlertStatusLabel(selectedAlert.status)}
                  </Tag>
                  <Tag className={styles.riskBadge} color="blue">
                    Risk score {selectedAlert.riskScore}
                  </Tag>
                </Space>

                <div>
                  <Title level={3} className={styles.heroTitle}>
                    {selectedAlert.title}
                  </Title>
                  <div className={styles.heroMetaRow}>
                    <Text type="secondary">{selectedAlert.alertId}</Text>
                    <span className={styles.heroMetaDot} />
                    <Text type="secondary">
                      Triggered {formatDateTime(selectedAlert.triggeredAt)}
                    </Text>
                  </div>
                </div>
              </div>

              <div className={styles.heroActionRail}>
                {canReviewAlerts ? (
                  <Tag className={styles.workflowPill} color={resolveStatusTone(selectedAlert.status)}>
                    Review workflow enabled
                  </Tag>
                ) : (
                  <Tag className={styles.workflowPill}>Read-only access</Tag>
                )}
                {canExportReports ? (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportReport}
                    loading={isExportingReport}
                  >
                    Export incident report
                  </Button>
                ) : null}
              </div>
            </div>

            <div className={styles.heroStatGrid}>
              <div className={styles.heroStatCard}>
                <span className={styles.metricLabel}>Primary actor</span>
                <strong>{selectedAlert.primaryActorUser || "Unknown actor"}</strong>
                <span className={styles.cellHint}>
                  {selectedAlert.primaryActorIp || "IP not captured"}
                </span>
              </div>
              <div className={styles.heroStatCard}>
                <span className={styles.metricLabel}>Affected scope</span>
                <strong>{selectedAlert.databaseName || "Database not linked"}</strong>
                <span className={styles.cellHint}>
                  {selectedAlert.tableName || selectedAlert.serverName || "No table or server linked"}
                </span>
              </div>
              <div className={styles.heroStatCard}>
                <span className={styles.metricLabel}>Investigation trail</span>
                <strong>{selectedAlert.relatedEventCount} related events</strong>
                <span className={styles.cellHint}>
                  {history.length} status updates and {notes.length} notes recorded
                </span>
              </div>
            </div>
          </div>

          <div className={styles.detailWorkspaceGrid}>
            <div className={styles.detailMainColumn}>
              <AlertAiPanel
                isLoading={isAiLoading}
                error={aiError}
                analysis={aiAnalysis}
                severityLabel={resolveAlertSeverityLabel(selectedAlert.severity)}
                onRetry={retryAiAnalysis}
              />

              <div className={styles.detailSection}>
                <Title level={5} className={styles.sectionTitle}>
                  Incident summary
                </Title>
                <Paragraph className={styles.summaryLead}>{selectedAlert.summary}</Paragraph>
                {selectedAlert.recommendedActions.length > 0 ? (
                  <>
                    <Divider className={styles.sectionDivider} />
                    <div className={styles.recommendationHeader}>
                      <FileSearchOutlined />
                      <Text strong>Suggested investigation actions</Text>
                    </div>
                    <List
                      dataSource={selectedAlert.recommendedActions}
                      split={false}
                      renderItem={(item) => (
                        <List.Item className={styles.recommendationItem}>
                          <CheckCircleOutlined className={styles.recommendationIcon} />
                          <span>{item}</span>
                        </List.Item>
                      )}
                    />
                  </>
                ) : null}
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
                    <span className={styles.metricLabel}>Current status</span>
                    <strong>{resolveAlertStatusLabel(selectedAlert.status)}</strong>
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
                    <span className={styles.metricLabel}>Alert window</span>
                    <strong>
                      {formatDateTime(selectedAlert.eventTimeStart)} to{" "}
                      {formatDateTime(selectedAlert.eventTimeEnd)}
                    </strong>
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
                      children: (
                        <div className={styles.timelineCard}>
                          <strong>
                            {resolveAlertStatusLabel(item.fromStatus)} to{" "}
                            {resolveAlertStatusLabel(item.toStatus)}
                          </strong>
                          <div className={styles.cellHint}>
                            {item.creatorUserDisplayName || "System"} |{" "}
                            {formatDateTime(item.creationTime)}
                          </div>
                          {item.comment ? (
                            <Paragraph className={styles.timelineComment}>
                              {item.comment}
                            </Paragraph>
                          ) : null}
                        </div>
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
                <div className={styles.sectionHeaderRow}>
                  <Title level={5} className={styles.sectionTitle}>
                    Incident notes
                  </Title>
                  <Tag className={styles.countTag}>{notes.length} notes</Tag>
                </div>
                {notes.length > 0 ? (
                  <div className={styles.noteList}>
                    {notes.map((note) => {
                      const author = resolveNoteAuthor(
                        note.creatorUserDisplayName,
                        note.creatorUserId,
                      );
                      return (
                        <div key={note.id} className={styles.noteCard}>
                          <div className={styles.noteCardHeader}>
                            <div className={styles.noteMeta}>
                              {formatDateTime(note.creationTime)}
                              {author}
                            </div>
                            {note.isInternal ? (
                              <Tag className={styles.internalNoteTag}>Internal</Tag>
                            ) : (
                              <Tag className={styles.sharedNoteTag}>Shared</Tag>
                            )}
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
            </div>

            <div className={styles.detailSideColumn}>
              <div className={styles.actionPanel}>
                <div className={styles.actionPanelHeader}>
                  <ClockCircleOutlined />
                  <div>
                    <Title level={5} className={styles.sectionTitle}>
                      Review workflow
                    </Title>
                    <Paragraph className={styles.sectionLead}>
                      Manage alert disposition and keep the investigation trail up to date.
                    </Paragraph>
                  </div>
                </div>

                {canReviewAlerts ? (
                  <>
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
                        label="Change status"
                        rules={[{ required: true, message: "Choose a status." }]}
                      >
                        <Select
                          placeholder="Select the next workflow state"
                          options={ALERT_REVIEW_STATUS_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="comment" label="Review note">
                        <Input.TextArea
                          rows={3}
                          placeholder="Explain why the status is changing..."
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isUpdatingStatus}
                        block
                      >
                        Save status update
                      </Button>
                    </Form>

                    <Divider className={styles.sectionDivider} />

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
                        label="Add incident note"
                        rules={[{ required: true, message: "Enter a note." }]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Capture evidence, ownership, or next steps..."
                        />
                      </Form.Item>
                      <Form.Item name="isInternal" valuePropName="checked">
                        <Checkbox>Keep this note internal</Checkbox>
                      </Form.Item>
                      <Button
                        icon={<MessageOutlined />}
                        htmlType="submit"
                        loading={isCreatingNote}
                        block
                      >
                        Add note
                      </Button>
                    </Form>
                  </>
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    message="You can review this alert in read-only mode, but status changes and notes require review access."
                  />
                )}
              </div>

              <div className={styles.actionPanel}>
                <div className={styles.actionPanelHeader}>
                  <DownloadOutlined />
                  <div>
                    <Title level={5} className={styles.sectionTitle}>
                      Reporting
                    </Title>
                    <Paragraph className={styles.sectionLead}>
                      Export this incident package for audit records or demo walkthroughs.
                    </Paragraph>
                  </div>
                </div>

                <div className={styles.drawerActions}>
                  <Button
                    type={canExportReports ? "default" : "dashed"}
                    icon={<DownloadOutlined />}
                    onClick={handleExportReport}
                    loading={isExportingReport}
                    disabled={!canExportReports}
                    block
                  >
                    Export incident report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
};

export default SecurityAlertDetailView;
