"use client";

import { useState } from "react";
import type { UploadProps } from "antd";
import { Button, Form, Input, Select, Typography, Upload } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeFormSharedProps } from "@/interfaces/datasentinel/intakeComponents";
import { ingestActivityEvents } from "@/utils/datasentinel/intakeService";
import {
  applyReferenceDefaults,
  extractActivityEvents,
  parseJsonPayload,
  resolveDatabaseOptions,
  resolveErrorMessage,
} from "@/utils/datasentinel/intakeHelpers";

const { Paragraph } = Typography;

const ManualActivityBatchForm = ({
  allDatabases,
  isLoadingReferences,
  monitoredServers,
  onMessage,
  onResult,
}: IIntakeFormSharedProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const manualServerId = Form.useWatch("serverId", form) as string | undefined;

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
          const events = applyReferenceDefaults(
            extractActivityEvents(parsed),
            values.serverId,
            values.databaseId,
          );

          const result = await ingestActivityEvents({ events });
          onResult("Manual activity batch", result);
          onMessage({ type: "success", text: "Manual activity batch submitted successfully." });
        } catch (error: unknown) {
          onMessage({ type: "error", text: resolveErrorMessage(error) });
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className={styles.splitGrid}>
        <div className={styles.stackedCards}>
          <Form.Item
            name="serverId"
            label="Default server"
            rules={[{ required: true, message: "Choose a monitored server." }]}
          >
            <Select
              loading={isLoadingReferences}
              className={styles.fullWidthControl}
              placeholder="Select a monitored server"
              onChange={() => form.setFieldValue("databaseId", undefined)}
              options={monitoredServers.map((server) => ({
                value: server.id,
                label: `${server.name} (${server.hostName})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="databaseId"
            label="Default database"
            rules={[{ required: true, message: "Choose a monitored database." }]}
          >
            <Select
              loading={isLoadingReferences}
              disabled={!manualServerId}
              className={styles.fullWidthControl}
              placeholder="Select a monitored database"
              options={resolveDatabaseOptions(allDatabases, manualServerId)}
            />
          </Form.Item>
          <Paragraph className={styles.sectionLead}>
            Choose the monitored server and database that this batch belongs to before submitting the payload.
          </Paragraph>
          <Upload beforeUpload={handleUpload} showUploadList={false}>
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
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default ManualActivityBatchForm;
