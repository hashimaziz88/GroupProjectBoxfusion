"use client";

import { useState } from "react";
import { Button, Checkbox, Form, InputNumber, Select } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeFormSharedProps } from "@/interfaces/datasentinel/intakeComponents";
import { seedSimulatedAbpAuditLogs } from "@/utils/datasentinel/intakeService";
import { resolveDatabaseOptions, resolveErrorMessage } from "@/utils/datasentinel/intakeHelpers";

const SeedSimulatedLogsForm = ({
  allDatabases,
  isLoadingReferences,
  monitoredServers,
  onMessage,
  onResult,
}: IIntakeFormSharedProps) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const seedServerId = Form.useWatch("serverId", form) as string | undefined;

  return (
    <Form
      form={form}
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

          onResult("Seeded ABP audit log simulation", result);
          onMessage({ type: "success", text: "Seeded ABP audit log simulation completed." });
        } catch (error: unknown) {
          onMessage({ type: "error", text: resolveErrorMessage(error) });
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
        <Form.Item name="count" label="Audit log count" rules={[{ required: true }]}>
          <InputNumber min={1} max={500} className={styles.fullWidthControl} />
        </Form.Item>
        <Form.Item name="seed" label="Seed">
          <InputNumber className={styles.fullWidthControl} />
        </Form.Item>
        <Form.Item name="includeFailures" valuePropName="checked" className={styles.filterField}>
          <Checkbox>Include failure scenarios</Checkbox>
        </Form.Item>
      </div>
      <div className={styles.formActions}>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          Run seeded simulation
        </Button>
        <Button onClick={() => form.resetFields()}>Reset</Button>
      </div>
    </Form>
  );
};

export default SeedSimulatedLogsForm;
