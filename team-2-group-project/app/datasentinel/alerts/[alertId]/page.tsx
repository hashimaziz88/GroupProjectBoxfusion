"use client";

import { useParams } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Switch,
  Table,
  Timeline,
  Typography,
} from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import SeverityTag from "@/components/datasentinel/SeverityTag";
import StatusTag from "@/components/datasentinel/StatusTag";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { ALERT_STATUS_OPTIONS } from "@/constants/datasentinel/options";
import { useStyles } from "@/app/style/style";
import { useAuthState } from "@/providers/authProvider";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { formatDateTime, toArray } from "@/utils/helpers";
import { activityTypeLabel } from "@/utils/datasentinel/helpers";
import { hasPermission } from "@/utils/auth/roles";

const { Paragraph, Text, Title } = Typography;
const { TextArea } = Input;

const AlertDetailPageContent = () => {
  const params = useParams();
  const resolvedAlertId = Array.isArray(params.alertId)
    ? params.alertId[0]
    : params.alertId;
  const alertId = Number(resolvedAlertId);
  const { styles } = useStyles();
  const { permissions } = useAuthState();
  const { alertDetail: detail, isAlertDetailPending, errorMessage } =
    useDataSentinelState();
  const { changeAlertStatus, createAlertNote, loadAlertDetail } =
    useDataSentinelActions();
  const canReview = hasPermission(permissions, PERMISSIONS.datasentinelAlertsReview);
  const [statusOverride, setStatusOverride] = useState<number | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteInternal, setNoteInternal] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const statusValue =
    statusOverride ?? (detail?.id === alertId ? detail.status : 0);

  const loadDetailOnMount = useEffectEvent(async () => {
    await loadAlertDetail(alertId);
  });

  useEffect(() => {
    void loadDetailOnMount();
  }, [alertId]);

  const noteTimeline = useMemo(
    () =>
      toArray(detail?.notes).map((note) => ({
        children: (
          <div style={{ paddingBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>{note.createdByName || "System"}</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {formatDateTime(note.createdAt)}
              {note.isInternal ? " • Internal note" : " • Analyst note"}
            </div>
            <div style={{ marginTop: 8 }}>{note.body}</div>
          </div>
        ),
      })),
    [detail?.notes],
  );

  return (
    <AppShell
      title="Alert Investigation"
      subtitle="Review alert evidence, update workflow status, and capture analyst notes for the incident record."
    >
      <QueryState
        isLoading={isAlertDetailPending}
        errorMessage={errorMessage}
        isEmpty={!detail || detail.id !== alertId}
        emptyDescription="This alert could not be found in the current tenant."
      >
        {detail && detail.id === alertId ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Severity</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <SeverityTag severity={detail.severity} />
                </div>
                <span className={styles.statHint}>{detail.ruleName}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Status</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StatusTag status={detail.status} />
                </div>
                <span className={styles.statHint}>Created {formatDateTime(detail.createdAt)}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Primary actor</span>
                <span className={styles.statValue} style={{ fontSize: 22 }}>
                  {detail.primaryActorUser || "Unknown"}
                </span>
                <span className={styles.statHint}>{detail.primaryActorIp || "No source IP recorded"}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Related events</span>
                <span className={styles.statValue}>{detail.relatedEventCount}</span>
                <span className={styles.statHint}>
                  Window {formatDateTime(detail.eventTimeStart)} to {formatDateTime(detail.eventTimeEnd)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
                gap: 16,
              }}
            >
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Alert summary
                </Title>
                <Paragraph className={styles.sectionLead}>{detail.summary}</Paragraph>
                <Paragraph style={{ marginBottom: 8 }}>
                  <Text strong>Rule</Text>: {detail.ruleName}
                </Paragraph>
                <Paragraph style={{ marginBottom: 18 }}>
                  <Text strong>Rule description</Text>: {detail.ruleDescription || "No description"}
                </Paragraph>
                <Title level={5} className={styles.sectionTitle}>
                  Evidence snapshot
                </Title>
                <pre
                  style={{
                    margin: 0,
                    padding: 18,
                    borderRadius: 18,
                    background: "#0f172a",
                    color: "#e2e8f0",
                    whiteSpace: "pre-wrap",
                    fontSize: 12,
                  }}
                >
                  {detail.topEvidenceJson || "No evidence blob attached to this alert."}
                </pre>
              </Card>

              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Workflow controls
                </Title>
                <Paragraph className={styles.sectionLead}>
                  Update triage status and capture a rationale directly on the incident timeline.
                </Paragraph>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Select
                    value={statusValue}
                    disabled={!canReview}
                    onChange={(value) => setStatusOverride(value)}
                    options={ALERT_STATUS_OPTIONS.map((item) => ({ ...item }))}
                  />
                  <TextArea
                    rows={4}
                    disabled={!canReview}
                    value={statusComment}
                    onChange={(event) => setStatusComment(event.target.value)}
                    placeholder="Comment on why the status changed..."
                  />
                  <Button
                    type="primary"
                    disabled={!canReview}
                    loading={isSavingStatus}
                    onClick={() => {
                      setIsSavingStatus(true);
                      void changeAlertStatus({
                        alertId,
                        status: statusValue,
                        comment: statusComment,
                      })
                        .then((result) => {
                          if (result) {
                            setStatusOverride(null);
                          }
                          setStatusComment("");
                        })
                        .finally(() => {
                          setIsSavingStatus(false);
                        });
                    }}
                  >
                    Save status
                  </Button>
                </div>
              </Card>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: 16,
              }}
            >
              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Incident notes
                </Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                  <TextArea
                    rows={4}
                    disabled={!canReview}
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                    placeholder="Add analyst notes, redacted findings, or follow-up tasks..."
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Switch
                      checked={noteInternal}
                      disabled={!canReview}
                      onChange={setNoteInternal}
                    />
                    <span>Mark as internal note</span>
                  </div>
                  <Button
                    disabled={!canReview || !noteBody.trim()}
                    loading={isSavingNote}
                    onClick={() => {
                      setIsSavingNote(true);
                      void createAlertNote({
                        alertId,
                        body: noteBody,
                        isInternal: noteInternal,
                      })
                        .then(() => loadAlertDetail(alertId))
                        .then(() => setNoteBody(""))
                        .finally(() => {
                          setIsSavingNote(false);
                        });
                    }}
                  >
                    Add note
                  </Button>
                </div>
                <Timeline items={noteTimeline} />
              </Card>

              <Card className={styles.pageCard}>
                <Title level={4} className={styles.sectionTitle}>
                  Status history
                </Title>
                <Timeline
                  items={toArray(detail.statusHistory).map((history) => ({
                    children: (
                      <div style={{ paddingBottom: 8 }}>
                        <div style={{ fontWeight: 700 }}>
                          {history.changedByName || "System"} moved the alert to{" "}
                          <StatusTag status={history.toStatus} />
                        </div>
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                          {formatDateTime(history.changedAt)}
                        </div>
                        {history.comment ? <div style={{ marginTop: 8 }}>{history.comment}</div> : null}
                      </div>
                    ),
                  }))}
                />
              </Card>
            </div>

            <Card className={styles.pageCard}>
              <Title level={4} className={styles.sectionTitle}>
                Related activity
              </Title>
              <Table
                rowKey="id"
                pagination={false}
                dataSource={toArray(detail.relatedEvents)}
                className={styles.table}
                columns={[
                  {
                    title: "Time",
                    dataIndex: "eventTime",
                    key: "eventTime",
                    render: (value: string) => formatDateTime(value),
                  },
                  {
                    title: "Type",
                    dataIndex: "eventType",
                    key: "eventType",
                    render: (value: number) => activityTypeLabel(value),
                  },
                  {
                    title: "Server / DB",
                    key: "asset",
                    render: (_, record) => (
                      <div>
                        <div>{record.serverName || "Unknown server"}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          {record.databaseName || "Unknown database"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Operation",
                    key: "operation",
                    render: (_, record) => (
                      <div>
                        <div>{record.operation || "N/A"}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          {record.objectName || "No object captured"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "Outcome",
                    key: "outcome",
                    render: (_, record) => (
                      <div>
                        <SeverityTag severity={record.severity} />
                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                          {record.isSuccessful ? "Successful" : "Failed"} • {record.durationMs} ms
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </>
        ) : null}
      </QueryState>
    </AppShell>
  );
};

export default withAuth(AlertDetailPageContent, PERMISSIONS.datasentinelAlertsView);
