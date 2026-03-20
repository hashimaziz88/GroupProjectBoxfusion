"use client";

import { useState } from "react";
import type { UploadProps } from "antd";
import { Button, Form, Input, Select, Typography, Upload } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeFormSharedProps } from "@/interfaces/datasentinel/intakeComponents";
import { ingestAbpAuditLogs } from "@/utils/datasentinel/intakeService";
import {
  extractAuditLogs,
  normalizeAuditLogsForTenant,
  parseJsonPayload,
  resolveDatabaseOptions,
  resolveErrorMessage,
} from "@/utils/datasentinel/intakeHelpers";

const { Paragraph } = Typography;

const AbpAuditLogUploadForm = ({
  currentTenantId,
  allDatabases,
  isLoadingReferences,
  monitoredServers,
  onMessage,
  onResult,
}: IIntakeFormSharedProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auditServerId = Form.useWatch("serverId", form) as string | undefined;

  const handleUpload: UploadProps["beforeUpload"] = async (file) => {
    const text = await file.text();
    form.setFieldValue("payload", text);
    onMessage({ type: "success", text: `${file.name} loaded into the editor.` });
    return false;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ payload: "", serverId: undefined, databaseId: undefined }}
      onFinish={async (values) => {
        setIsSubmitting(true);

        try {
          const parsed = parseJsonPayload(values.payload);
          const abpAuditLogs = extractAuditLogs(parsed);
          const { normalizedAuditLogs, normalizedCount } =
            normalizeAuditLogsForTenant(abpAuditLogs, currentTenantId);

          const result = await ingestAbpAuditLogs({
            serverId: values.serverId,
            databaseId: values.databaseId,
            abpAuditLogs: normalizedAuditLogs,
          });

          onResult("ABP audit log upload", result);
          onMessage({
            type: "success",
            text:
              normalizedCount > 0
                ? `ABP audit logs submitted successfully. TenantId was aligned to the active tenant for ${normalizedCount} item(s).`
                : "ABP audit logs submitted successfully.",
          });
        } catch (error: unknown) {
          onMessage({ type: "error", text: resolveErrorMessage(error) });
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
          <Upload beforeUpload={handleUpload} showUploadList={false}>
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
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AbpAuditLogUploadForm;
