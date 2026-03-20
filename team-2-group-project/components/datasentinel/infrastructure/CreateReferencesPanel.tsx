"use client";

import { useState } from "react";
import { Alert, Button, Card, Checkbox, Form, Input, Select, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import { resolveServerName } from "@/utils/datasentinel/infrastructureHelpers";

const { Paragraph, Title } = Typography;

const CreateReferencesPanel = () => {
  const { styles } = useStyles();
  const { allDatabases, canManageInfrastructure, servers } =
    useMonitoringInfrastructureState();
  const { clearMessages, createDatabase, createServer, createTable } =
    useMonitoringInfrastructureActions();

  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [serverForm] = Form.useForm();
  const [databaseForm] = Form.useForm();
  const [tableForm] = Form.useForm();

  return (
    <Card className={styles.pageCard}>
      <Title level={4} className={styles.sectionTitle}>
        Create references
      </Title>
      <Paragraph className={styles.sectionLead}>
        These forms map directly to the current monitoring create endpoints so tenants can establish valid references before ingestion.
      </Paragraph>

      {canManageInfrastructure ? (
        <div className={styles.tripleGrid}>
          <Card className={styles.pageCard}>
            <Title level={5} className={styles.sectionTitle}>
              Monitored server
            </Title>
            <Form
              form={serverForm}
              layout="vertical"
              initialValues={{ isEnabled: true }}
              onFinish={async (values) => {
                clearMessages();
                setIsCreatingServer(true);
                try {
                  const wasCreated = await createServer(values);

                  if (wasCreated) {
                    serverForm.resetFields();
                    serverForm.setFieldValue("isEnabled", true);
                  }
                } finally {
                  setIsCreatingServer(false);
                }
              }}
            >
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="Demo PostgreSQL Cluster" />
              </Form.Item>
              <Form.Item name="hostName" label="Host name" rules={[{ required: true }]}>
                <Input placeholder="tenant-1-pg-demo-01" />
              </Form.Item>
              <Form.Item name="environment" label="Environment" rules={[{ required: true }]}>
                <Input placeholder="Demo" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="isEnabled" valuePropName="checked">
                <Checkbox>Enabled</Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={isCreatingServer}>
                Create server
              </Button>
            </Form>
          </Card>

          <Card className={styles.pageCard}>
            <Title level={5} className={styles.sectionTitle}>
              Monitored database
            </Title>
            <Form
              form={databaseForm}
              layout="vertical"
              initialValues={{ isEnabled: true }}
              onFinish={async (values) => {
                clearMessages();
                setIsCreatingDatabase(true);
                try {
                  const wasCreated = await createDatabase(values);

                  if (wasCreated) {
                    databaseForm.resetFields();
                    databaseForm.setFieldValue("isEnabled", true);
                  }
                } finally {
                  setIsCreatingDatabase(false);
                }
              }}
            >
              <Form.Item name="serverId" label="Server" rules={[{ required: true }]}>
                <Select
                  options={servers.map((server) => ({
                    value: server.id,
                    label: `${server.name} (${server.hostName})`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input placeholder="BoxfusionCore" />
              </Form.Item>
              <Form.Item name="engine" label="Engine" rules={[{ required: true }]}>
                <Input placeholder="PostgreSQL" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="isEnabled" valuePropName="checked">
                <Checkbox>Enabled</Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={isCreatingDatabase}>
                Create database
              </Button>
            </Form>
          </Card>

          <Card className={styles.pageCard}>
            <Title level={5} className={styles.sectionTitle}>
              Monitored table
            </Title>
            <Form
              form={tableForm}
              layout="vertical"
              initialValues={{ isEnabled: true }}
              onFinish={async (values) => {
                clearMessages();
                setIsCreatingTable(true);
                try {
                  const wasCreated = await createTable(values);

                  if (wasCreated) {
                    tableForm.resetFields();
                    tableForm.setFieldValue("isEnabled", true);
                  }
                } finally {
                  setIsCreatingTable(false);
                }
              }}
            >
              <Form.Item name="databaseId" label="Database" rules={[{ required: true }]}>
                <Select
                  options={allDatabases.map((database) => ({
                    value: database.id,
                    label: `${database.name} (${resolveServerName(servers, database.serverId)})`,
                  }))}
                />
              </Form.Item>
              <Form.Item name="schemaName" label="Schema" rules={[{ required: true }]}>
                <Input placeholder="public" />
              </Form.Item>
              <Form.Item name="name" label="Table name" rules={[{ required: true }]}>
                <Input placeholder="abp_audit_logs" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="isEnabled" valuePropName="checked">
                <Checkbox>Enabled</Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={isCreatingTable}>
                Create table
              </Button>
            </Form>
          </Card>
        </div>
      ) : (
        <Alert
          type="info"
          showIcon
          title="You can view monitored infrastructure here, but creating or bootstrapping references requires Pages.DataSentinel.Infrastructure.Manage."
        />
      )}
    </Card>
  );
};

export default CreateReferencesPanel;
