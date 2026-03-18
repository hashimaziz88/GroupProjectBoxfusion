"use client";

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { useStyles } from "@/app/style/style";
import AppShell from "@/components/auth/AppShell";
import { PERMISSIONS } from "@/constants/auth/roles";
import { withAuth } from "@/hoc/withAuth";
import {
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
  IMonitoredTableListItem,
} from "@/interfaces/datasentinel/monitoring";
import {
  MonitoringInfrastructureProvider,
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import { formatDateTime, toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const resolveServerName = (
  servers: IMonitoredServerListItem[],
  serverId: string,
) => servers.find((server) => server.id === serverId)?.name ?? "Unknown server";

const resolveDatabaseName = (
  databases: IMonitoredDatabaseListItem[],
  databaseId: string,
) =>
  databases.find((database) => database.id === databaseId)?.name ??
  "Unknown database";

const MonitoringInfrastructurePage = () => {
  const { styles } = useStyles();
  const {
    actionMessage,
    allDatabases,
    allTables,
    availableDatabases,
    bootstrapResult,
    canManageInfrastructure,
    databaseItems,
    errorMessage,
    hasTenantContext,
    isDatabaseLoading,
    isLoading,
    isRefreshing,
    isTableLoading,
    selectedDatabaseId,
    selectedServerId,
    servers,
    tableItems,
  } = useMonitoringInfrastructureState();
  const {
    bootstrapDemo,
    clearMessages,
    createDatabase,
    createServer,
    createTable,
    refreshInfrastructure,
    setSelectedDatabaseId,
    setSelectedServerId,
  } = useMonitoringInfrastructureActions();

  const [serverForm] = Form.useForm();
  const [databaseForm] = Form.useForm();
  const [tableForm] = Form.useForm();
  const [bootstrapForm] = Form.useForm();

  const serverColumns = [
    {
      title: "Server",
      key: "server",
      render: (_: unknown, record: IMonitoredServerListItem) => (
        <>
          <strong>{record.name}</strong>
          <div className={styles.cellHint}>{record.hostName}</div>
        </>
      ),
    },
    {
      title: "Environment",
      dataIndex: "environment",
      key: "environment",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Status",
      key: "isEnabled",
      render: (_: unknown, record: IMonitoredServerListItem) => (
        <Tag color={record.isEnabled ? "green" : "default"}>
          {record.isEnabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Databases",
      key: "databases",
      render: (_: unknown, record: IMonitoredServerListItem) =>
        toArray(record.databases).length,
    },
    {
      title: "Last heartbeat",
      dataIndex: "lastHeartbeatAt",
      key: "lastHeartbeatAt",
      render: (value?: string | null) => formatDateTime(value),
    },
  ];

  const databaseColumns = [
    {
      title: "Database",
      key: "database",
      render: (_: unknown, record: IMonitoredDatabaseListItem) => (
        <>
          <strong>{record.name}</strong>
          <div className={styles.cellHint}>{record.engine}</div>
        </>
      ),
    },
    {
      title: "Server",
      key: "serverName",
      render: (_: unknown, record: IMonitoredDatabaseListItem) =>
        resolveServerName(servers, record.serverId),
    },
    {
      title: "Status",
      key: "isEnabled",
      render: (_: unknown, record: IMonitoredDatabaseListItem) => (
        <Tag color={record.isEnabled ? "green" : "default"}>
          {record.isEnabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Tables",
      key: "tables",
      render: (_: unknown, record: IMonitoredDatabaseListItem) =>
        toArray(record.tables).length,
    },
    {
      title: "Last activity",
      dataIndex: "lastActivityAt",
      key: "lastActivityAt",
      render: (value?: string | null) => formatDateTime(value),
    },
  ];

  const tableColumns = [
    {
      title: "Table",
      key: "table",
      render: (_: unknown, record: IMonitoredTableListItem) => (
        <>
          <strong>{record.name}</strong>
          <div className={styles.cellHint}>{record.schemaName}</div>
        </>
      ),
    },
    {
      title: "Database",
      key: "databaseName",
      render: (_: unknown, record: IMonitoredTableListItem) =>
        resolveDatabaseName(allDatabases, record.databaseId),
    },
    {
      title: "Status",
      key: "isEnabled",
      render: (_: unknown, record: IMonitoredTableListItem) => (
        <Tag color={record.isEnabled ? "green" : "default"}>
          {record.isEnabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Last activity",
      dataIndex: "lastActivityAt",
      key: "lastActivityAt",
      render: (value?: string | null) => formatDateTime(value),
    },
  ];

  if (!hasTenantContext) {
    return (
      <AppShell
        title="Monitoring Infrastructure"
        subtitle="Inspect tenant-scoped monitored servers, databases, and tables, then create or bootstrap the references required by DataSentinel intake."
      >
        <Alert
          type="info"
          showIcon
          message="DataSentinel infrastructure is tenant-scoped. Switch into a tenant before managing monitoring references."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Monitoring Infrastructure"
      subtitle="Inspect tenant-scoped monitored servers, databases, and tables, then create or bootstrap the references required by DataSentinel intake."
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
          <span className={styles.statValue}>{servers.length}</span>
          <span className={styles.statHint}>
            Tenant infrastructure entry points currently available to DataSentinel.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Databases</span>
          <span className={styles.statValue}>{allDatabases.length}</span>
          <span className={styles.statHint}>
            Database references available for activity mapping and validation.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tables</span>
          <span className={styles.statValue}>{allTables.length}</span>
          <span className={styles.statHint}>
            Optional object-level references already modeled in the backend.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <div className={styles.cardToolbar}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              Inventory
            </Title>
            <Paragraph className={styles.sectionLead}>
              This mirrors the backend monitoring services directly, including scoped database and table lookups.
            </Paragraph>
          </div>

          <div className={styles.inlineActions}>
            <Select
              allowClear
              placeholder="Filter by server"
              value={selectedServerId}
              className={styles.toolbarControl}
              options={servers.map((server) => ({
                value: server.id,
                label: `${server.name} (${server.hostName})`,
              }))}
              onChange={(value) => setSelectedServerId(value)}
            />
            <Select
              allowClear
              placeholder="Filter by database"
              value={selectedDatabaseId}
              className={styles.toolbarControl}
              options={availableDatabases.map((database) => ({
                value: database.id,
                label: database.name,
              }))}
              onChange={(value) => setSelectedDatabaseId(value)}
            />
            <Button onClick={() => void refreshInfrastructure()} loading={isRefreshing}>
              Refresh
            </Button>
          </div>
        </div>

        <div className={styles.stackedCards}>
          <Table<IMonitoredServerListItem>
            rowKey="id"
            loading={isLoading}
            dataSource={servers}
            className={styles.table}
            columns={serverColumns}
            pagination={false}
          />

          <div className={styles.splitGrid}>
            <Card className={styles.pageCard}>
              <Title level={5} className={styles.sectionTitle}>
                Databases
              </Title>
              <Table<IMonitoredDatabaseListItem>
                rowKey="id"
                loading={isDatabaseLoading}
                dataSource={databaseItems}
                className={styles.table}
                columns={databaseColumns}
                pagination={false}
              />
            </Card>

            <Card className={styles.pageCard}>
              <Title level={5} className={styles.sectionTitle}>
                Tables
              </Title>
              <Table<IMonitoredTableListItem>
                rowKey="id"
                loading={isTableLoading}
                dataSource={tableItems}
                className={styles.table}
                columns={tableColumns}
                pagination={false}
              />
            </Card>
          </div>
        </div>
      </Card>

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
                  const wasCreated = await createServer(values);

                  if (wasCreated) {
                    serverForm.resetFields();
                    serverForm.setFieldValue("isEnabled", true);
                  }
                }}
              >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input placeholder="Demo PostgreSQL Cluster" />
                </Form.Item>
                <Form.Item
                  name="hostName"
                  label="Host name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="tenant-1-pg-demo-01" />
                </Form.Item>
                <Form.Item
                  name="environment"
                  label="Environment"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Demo" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="isEnabled" valuePropName="checked">
                  <Checkbox>Enabled</Checkbox>
                </Form.Item>
                <Button type="primary" htmlType="submit">
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
                  const wasCreated = await createDatabase(values);

                  if (wasCreated) {
                    databaseForm.resetFields();
                    databaseForm.setFieldValue("isEnabled", true);
                  }
                }}
              >
                <Form.Item
                  name="serverId"
                  label="Server"
                  rules={[{ required: true }]}
                >
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
                <Button type="primary" htmlType="submit">
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
                  const wasCreated = await createTable(values);

                  if (wasCreated) {
                    tableForm.resetFields();
                    tableForm.setFieldValue("isEnabled", true);
                  }
                }}
              >
                <Form.Item
                  name="databaseId"
                  label="Database"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={allDatabases.map((database) => ({
                      value: database.id,
                      label: `${database.name} (${resolveServerName(servers, database.serverId)})`,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="schemaName"
                  label="Schema"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="public" />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Table name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="abp_audit_logs" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="isEnabled" valuePropName="checked">
                  <Checkbox>Enabled</Checkbox>
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Create table
                </Button>
              </Form>
            </Card>
          </div>
        ) : (
          <Alert
            type="info"
            showIcon
            message="You can view monitored infrastructure here, but creating or bootstrapping references requires Pages.DataSentinel.Infrastructure.Manage."
          />
        )}
      </Card>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Bootstrap demo infrastructure
        </Title>
        <Paragraph className={styles.sectionLead}>
          This is the quickest way to provision a usable tenant demo footprint for activity ingestion and simulation.
        </Paragraph>

        <div className={styles.splitGrid}>
          <Card className={styles.pageCard}>
            {canManageInfrastructure ? (
              <Form
                form={bootstrapForm}
                layout="vertical"
                initialValues={{
                  serverName: "Demo PostgreSQL Cluster",
                  environment: "Demo",
                  includeTables: true,
                }}
                onFinish={async (values) => {
                  clearMessages();
                  await bootstrapDemo(values);
                }}
              >
                <Form.Item name="serverName" label="Server name">
                  <Input />
                </Form.Item>
                <Form.Item name="hostName" label="Host name">
                  <Input placeholder="Optional override" />
                </Form.Item>
                <Form.Item name="environment" label="Environment">
                  <Input />
                </Form.Item>
                <Form.Item name="includeTables" valuePropName="checked">
                  <Checkbox>Seed monitored tables as well</Checkbox>
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  Bootstrap demo
                </Button>
              </Form>
            ) : (
              <Alert
                type="info"
                showIcon
                message="Demo bootstrap is available once the current user also has infrastructure manage permission."
              />
            )}
          </Card>

          <Card className={styles.pageCard}>
            <Title level={5} className={styles.sectionTitle}>
              Latest bootstrap result
            </Title>
            {bootstrapResult ? (
              <div className={styles.stackedCards}>
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Servers created</span>
                    <span className={styles.statValue}>
                      {bootstrapResult.createdServersCount}
                    </span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Databases created</span>
                    <span className={styles.statValue}>
                      {bootstrapResult.createdDatabasesCount}
                    </span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Tables created</span>
                    <span className={styles.statValue}>
                      {bootstrapResult.createdTablesCount}
                    </span>
                  </div>
                </div>

                <Paragraph className={styles.sectionLead}>
                  The backend returned the updated server graph, so the UI can immediately reuse those references for intake.
                </Paragraph>

                <div className={styles.tagRow}>
                  {toArray(bootstrapResult.servers).map((server) => (
                    <Tag key={server.id} className={styles.infoTag}>
                      {server.name}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : (
              <Paragraph className={styles.sectionLead}>
                Run the bootstrap action to create a demo cluster and see the counts returned by the backend.
              </Paragraph>
            )}
          </Card>
        </div>
      </Card>
    </AppShell>
  );
};


export default withAuth(
  MonitoringInfrastructurePage,
  PERMISSIONS.dataSentinelInfrastructureView,
);
