"use client";

import { useState } from "react";
import type { UploadProps } from "antd";
import { Button, Form, Input, Select, Typography, Upload } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeFormSharedProps } from "@/interfaces/datasentinel/intakeComponents";
import { importBatch } from "@/utils/datasentinel/intakeService";
import {
  applyReferenceDefaults,
  extractActivityEvents,
  parseJsonPayload,
  resolveDatabaseOptions,
  resolveErrorMessage,
} from "@/utils/datasentinel/intakeHelpers";

const { Paragraph } = Typography;

const ImportBatchForm = ({
  allDatabases,
  isLoadingReferences,
  monitoredServers,
  onMessage,
  onResult,
}: IIntakeFormSharedProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const importServerId = Form.useWatch("serverId", form) as string | undefined;

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

          const result = await importBatch({ events });
          onResult("Import batch", result);
          onMessage({ type: "success", text: "Batch import completed successfully." });
        } catch (error: unknown) {
          onMessage({ type: "error", text: resolveErrorMessage(error) });
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
              options={resolveDatabaseOptions(allDatabases, importServerId)}
            />
          </Form.Item>
          <Paragraph className={styles.sectionLead}>
            Import uses the same normalized activity event shape as the manual batch endpoint, routed through the dedicated import pipeline.
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
              Import batch
            </Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default ImportBatchForm;
