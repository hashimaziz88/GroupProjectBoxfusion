"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { UploadProps } from "antd";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { useAuthState } from "@/providers/authProvider";
import { toArray } from "@/utils/helpers";
import {
  ingestAbpAuditLogs,
  ingestActivityEvents,
  seedSimulatedAbpAuditLogs,
} from "@/utils/datasentinel/intakeService";
import { getMonitoredServers } from "@/utils/datasentinel/monitoringService";
import {
  IAbpAuditLogIngestionItem,
  IActivityEventIngestionItem,
  IActivityEventIngestionResult,
} from "@/interfaces/datasentinel/intake";
import { IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";

const { Paragraph, Text, Title } = Typography;

const resolveErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "The intake request failed.";

const extractActivityEvents = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload as IActivityEventIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.events)) {
    return payload.events as IActivityEventIngestionItem[];
  }

  throw new Error(
    "Manual activity payload must be an array or an object with an events array.",
  );
};

const extractAuditLogs = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload as IAbpAuditLogIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.abpAuditLogs)) {
    return payload.abpAuditLogs as IAbpAuditLogIngestionItem[];
  }

  if (isRecord(payload) && Array.isArray(payload.AbpAuditLogs)) {
    return payload.AbpAuditLogs as IAbpAuditLogIngestionItem[];
  }

  throw new Error(
    "ABP audit payload must be an array or an object with an abpAuditLogs/AbpAuditLogs array.",
  );
};

const parseJsonPayload = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("The JSON payload could not be parsed. Check the uploaded content and try again.");
  }
};

const applyReferenceDefaults = (
  events: IActivityEventIngestionItem[],
  serverId?: string,
  databaseId?: string,
) =>
  events.map((event) => ({
    ...event,
    serverId: event.serverId ?? serverId,
    databaseId: event.databaseId ?? databaseId,
  }));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

type FormFieldSetter = {
  setFieldValue: (fieldName: string, value: string) => void;
};

const ActivityIntakePageContent = () => {
  const { styles } = useStyles();
  const { currentTenant } = useAuthState();
  const [manualForm] = Form.useForm();
  const [auditForm] = Form.useForm();
  const [seedForm] = Form.useForm();

  const [monitoredServers, setMonitoredServers] = useState<IMonitoredServerListItem[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    label: string;
    result: IActivityEventIngestionResult;
  } | null>(null);
  const hasTenantContext = Boolean(currentTenant?.tenantId);

  const manualServerId = Form.useWatch("serverId", manualForm) as string | undefined;
  const auditServerId = Form.useWatch("serverId", auditForm) as string | undefined;
  const seedServerId = Form.useWatch("serverId", seedForm) as string | undefined;

  const allDatabases = monitoredServers.flatMap((server) =>
    toArray(server.databases).map((database) => ({
      ...database,
      serverName: server.name,
    })),
  );

  const loadReferenceData = useEffectEvent(async () => {
    setIsLoadingReferences(true);

    try {
      const result = await getMonitoredServers();
      setMonitoredServers(toArray(result.items));
      setErrorMessage(null);
    } catch (error: unknown) {
      setMonitoredServers([]);
      setErrorMessage(resolveErrorMessage(error));
    } finally {
      setIsLoadingReferences(false);
    }
  });

  useEffect(() => {
    if (!hasTenantContext) {
      setMonitoredServers([]);
      setIsLoadingReferences(false);
      return;
    }

    void loadReferenceData();
  }, [hasTenantContext]);

  const buildUploadHandler =
    (form: FormFieldSetter, fieldName: string): UploadProps["beforeUpload"] =>
    async (file) => {
      const text = await file.text();
      form.setFieldValue(fieldName, text);
      setActionMessage({
        type: "success",
        text: `${file.name} loaded into the editor.`,
      });
      return false;
    };

  const errorColumns = [
    {
      title: "Item index",
      dataIndex: "itemIndex",
      key: "itemIndex",
      width: 110,
    },
    {
      title: "Validation errors",
      key: "errors",
      render: (_: unknown, record: { errors?: string[] | null }) => (
        <div className={styles.tagRow}>
          {toArray(record.errors).map((error) => (
            <Tag key={error} color="red">
              {error}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  if (!hasTenantContext) {
    return (
      <AppShell
        title="Activity Intake"
        subtitle="Send manual activity batches, upload ABP audit logs, or seed simulated data through the currently available DataSentinel intake endpoints."
      >
        <Alert
          type="info"
          showIcon
          message="DataSentinel intake is tenant-scoped. Switch into a tenant before ingesting or seeding activity."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Activity Intake"
      subtitle="Send manual activity batches, upload ABP audit logs, or seed simulated data through the currently available DataSentinel intake endpoints."
    >
      {errorMessage ? (
        <Alert type="error" showIcon message={errorMessage} className={styles.alert} />
      ) : null}

      {actionMessage ? (
        <Alert
          type={actionMessage.type}
          showIcon
          message={actionMessage.text}
          className={styles.alert}
        />
      ) : null}

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Monitored servers</span>
          <span className={styles.statValue}>{monitoredServers.length}</span>
          <span className={styles.statHint}>
            Reference targets available for current-tenant event validation.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Monitored databases</span>
          <span className={styles.statValue}>{allDatabases.length}</span>
          <span className={styles.statHint}>
            Useful when attaching imported audit logs to a specific monitored workload.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Last accepted</span>
          <span className={styles.statValue}>
            {lastResult?.result.acceptedCount ?? 0}
          </span>
          <span className={styles.statHint}>
            The latest intake result returned by the backend in this session.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Intake workflows
        </Title>
        <Paragraph className={styles.sectionLead}>
          Use the same backend contracts the simulation pipeline already exposes. Manual activity accepts normalized event DTOs, while ABP upload and seeded simulation both work with the audit-log shape.
        </Paragraph>

        <Tabs
          items={[
            {
              key: "manual",
              label: "Manual activity batch",
              children: (
                <Form
                  form={manualForm}
                  layout="vertical"
                  initialValues={{ payload: "", serverId: undefined, databaseId: undefined }}
                  onFinish={async (values) => {
                    setIsSubmitting(true);

                    try {
                      const parsed = parseJsonPayload(values.payload);
                      const events = applyReferenceDefaults(
                        extractActivityEvents(parsed),
                        values.serverId,
                        values.databaseId,
                      );

                      const result = await ingestActivityEvents({ events });
                      setLastResult({
                        label: "Manual activity batch",
                        result,
                      });
                      setActionMessage({
                        type: "success",
                        text: "Manual activity batch submitted successfully.",
                      });
                    } catch (error: unknown) {
                      setActionMessage({
                        type: "error",
                        text: resolveErrorMessage(error),
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className={styles.splitGrid}>
                    <div className={styles.stackedCards}>
                      <Form.Item name="serverId" label="Default server">
                        <Select
                          allowClear
                          loading={isLoadingReferences}
                          className={styles.fullWidthControl}
                          options={monitoredServers.map((server) => ({
                            value: server.id,
                            label: `${server.name} (${server.hostName})`,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="databaseId" label="Default database">
                        <Select
                          allowClear
                          loading={isLoadingReferences}
                          className={styles.fullWidthControl}
                          options={resolveDatabaseOptions(allDatabases, manualServerId)}
                        />
                      </Form.Item>
                      <Paragraph className={styles.sectionLead}>
                        The defaults above are injected only when incoming manual items do not already carry `serverId` or `databaseId`.
                      </Paragraph>
                      <Upload
                        beforeUpload={buildUploadHandler(manualForm, "payload")}
                        showUploadList={false}
                      >
                        <Button>Load JSON file</Button>
                      </Upload>
                    </div>

                    <div className={styles.stackedCards}>
                      <Form.Item
                        name="payload"
                        label="Activity event JSON"
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea
                          className={styles.jsonTextArea}
                          placeholder='[{"eventTime":"2026-03-18T08:00:00Z","eventType":2,"actorUser":"admin","severity":0,"isSuccess":true}]'
                        />
                      </Form.Item>
                      <div className={styles.formActions}>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                          Submit manual batch
                        </Button>
                        <Button onClick={() => manualForm.resetFields()}>Reset</Button>
                      </div>
                    </div>
                  </div>
                </Form>
              ),
            },
            {
              key: "abp",
              label: "ABP audit log upload",
              children: (
                <Form
                  form={auditForm}
                  layout="vertical"
                  initialValues={{ payload: "", serverId: undefined, databaseId: undefined }}
                  onFinish={async (values) => {
                    setIsSubmitting(true);

                    try {
                      const parsed = parseJsonPayload(values.payload);
                      const abpAuditLogs = extractAuditLogs(parsed);

                      const result = await ingestAbpAuditLogs({
                        serverId: values.serverId,
                        databaseId: values.databaseId,
                        abpAuditLogs,
                      });

                      setLastResult({
                        label: "ABP audit log upload",
                        result,
                      });
                      setActionMessage({
                        type: "success",
                        text: "ABP audit logs submitted successfully.",
                      });
                    } catch (error: unknown) {
                      setActionMessage({
                        type: "error",
                        text: resolveErrorMessage(error),
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className={styles.splitGrid}>
                    <div className={styles.stackedCards}>
                      <Form.Item name="serverId" label="Monitored server">
                        <Select
                          allowClear
                          loading={isLoadingReferences}
                          className={styles.fullWidthControl}
                          options={monitoredServers.map((server) => ({
                            value: server.id,
                            label: `${server.name} (${server.hostName})`,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="databaseId" label="Monitored database">
                        <Select
                          allowClear
                          loading={isLoadingReferences}
                          className={styles.fullWidthControl}
                          options={resolveDatabaseOptions(allDatabases, auditServerId)}
                        />
                      </Form.Item>
                      <Paragraph className={styles.sectionLead}>
                        Uploaded audit logs are normalized into activity events and linked to the selected monitored references when provided.
                      </Paragraph>
                      <Upload
                        beforeUpload={buildUploadHandler(auditForm, "payload")}
                        showUploadList={false}
                      >
                        <Button>Load JSON file</Button>
                      </Upload>
                    </div>

                    <div className={styles.stackedCards}>
                      <Form.Item
                        name="payload"
                        label="ABP audit log JSON"
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea
                          className={styles.jsonTextArea}
                          placeholder='{"AbpAuditLogs":[{"serviceName":"Team2GroupProject.Controllers.TokenAuthController","methodName":"Authenticate","executionTime":"2026-03-18T08:00:00Z"}]}'
                        />
                      </Form.Item>
                      <div className={styles.formActions}>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                          Submit ABP logs
                        </Button>
                        <Button onClick={() => auditForm.resetFields()}>Reset</Button>
                      </div>
                    </div>
                  </div>
                </Form>
              ),
            },
            {
              key: "seed",
              label: "Seed simulated ABP logs",
              children: (
                <Form
                  form={seedForm}
                  layout="vertical"
                  initialValues={{
                    serverId: undefined,
                    databaseId: undefined,
                    count: 50,
                    seed: 42,
                    includeFailures: true,
                  }}
                  onFinish={async (values) => {
                    setIsSubmitting(true);

                    try {
                      const result = await seedSimulatedAbpAuditLogs({
                        serverId: values.serverId,
                        databaseId: values.databaseId,
                        count: values.count,
                        seed: values.seed ?? undefined,
                        includeFailures: values.includeFailures,
                      });

                      setLastResult({
                        label: "Seeded ABP audit log simulation",
                        result,
                      });
                      setActionMessage({
                        type: "success",
                        text: "Seeded ABP audit log simulation completed.",
                      });
                    } catch (error: unknown) {
                      setActionMessage({
                        type: "error",
                        text: resolveErrorMessage(error),
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className={styles.splitGrid}>
                    <Form.Item name="serverId" label="Monitored server">
                      <Select
                        allowClear
                        loading={isLoadingReferences}
                        className={styles.fullWidthControl}
                        options={monitoredServers.map((server) => ({
                          value: server.id,
                          label: `${server.name} (${server.hostName})`,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item name="databaseId" label="Monitored database">
                      <Select
                        allowClear
                        loading={isLoadingReferences}
                        className={styles.fullWidthControl}
                        options={resolveDatabaseOptions(allDatabases, seedServerId)}
                      />
                    </Form.Item>
                    <Form.Item
                      name="count"
                      label="Audit log count"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} max={500} className={styles.fullWidthControl} />
                    </Form.Item>
                    <Form.Item name="seed" label="Seed">
                      <InputNumber className={styles.fullWidthControl} />
                    </Form.Item>
                    <Form.Item
                      name="includeFailures"
                      valuePropName="checked"
                      className={styles.filterField}
                    >
                      <Checkbox>Include failure scenarios</Checkbox>
                    </Form.Item>
                  </div>
                  <div className={styles.formActions}>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                      Run seeded simulation
                    </Button>
                    <Button onClick={() => seedForm.resetFields()}>Reset</Button>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Card>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Latest result
        </Title>
        {lastResult ? (
          <div className={styles.stackedCards}>
            <Paragraph className={styles.sectionLead}>
              <Text strong>{lastResult.label}</Text> returned the following backend response.
            </Paragraph>

            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Received</span>
                <span className={styles.statValue}>
                  {lastResult.result.receivedCount}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Accepted</span>
                <span className={styles.statValue}>
                  {lastResult.result.acceptedCount}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Rejected</span>
                <span className={styles.statValue}>
                  {lastResult.result.rejectedCount}
                </span>
              </div>
            </div>

            {toArray(lastResult.result.createdEventIds).length ? (
              <div className={styles.stackedCards}>
                <Text strong>Created activity event IDs</Text>
                <div className={styles.tagRow}>
                  {toArray(lastResult.result.createdEventIds)
                    .slice(0, 12)
                    .map((createdEventId) => (
                      <Tag key={createdEventId} className={styles.infoTag}>
                        {createdEventId}
                      </Tag>
                    ))}
                </div>
              </div>
            ) : null}

            <Table
              rowKey={(record) => `${record.itemIndex}-${toArray(record.errors).join("|")}`}
              dataSource={toArray(lastResult.result.errors)}
              className={styles.table}
              columns={errorColumns}
              pagination={false}
            />
          </div>
        ) : (
          <Paragraph className={styles.sectionLead}>
            Submit any intake workflow above to inspect the backend validation and creation result here.
          </Paragraph>
        )}
      </Card>
    </AppShell>
  );
};

const resolveDatabaseOptions = (
  databases: Array<{
    id: string;
    name: string;
    serverId: string;
    serverName: string;
  }>,
  serverId?: string,
) =>
  (serverId
    ? databases.filter((database) => database.serverId === serverId)
    : databases
  ).map((database) => ({
    value: database.id,
    label: `${database.name} (${database.serverName})`,
  }));

export default withAuth(ActivityIntakePageContent, PERMISSIONS.dataSentinelIntake);
