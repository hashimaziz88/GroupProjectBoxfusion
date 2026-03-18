"use client";

import { Button, Card, Select, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import {
  IMonitoredDatabaseListItem,
  IMonitoredServerListItem,
  IMonitoredTableListItem,
} from "@/interfaces/datasentinel/monitoring";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import {
  resolveDatabaseName,
  resolveServerName,
} from "@/utils/datasentinel/infrastructureHelpers";
import { formatDateTime, toArray } from "@/utils/helpers";

const { Title } = Typography;

const InfrastructureInventory = () => {
  const { styles } = useStyles();
  const {
    allDatabases,
    availableDatabases,
    databaseItems,
    isDatabaseLoading,
    isLoading,
    isRefreshing,
    isTableLoading,
    selectedDatabaseId,
    selectedServerId,
    servers,
    tableItems,
  } = useMonitoringInfrastructureState();
  const { refreshInfrastructure, setSelectedDatabaseId, setSelectedServerId } =
    useMonitoringInfrastructureActions();

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

  return (
    <Card className={styles.pageCard}>
      <div className={styles.cardToolbar}>
        <div>
          <Title level={4} className={styles.sectionTitle}>
            Inventory
          </Title>
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
  );
};

export default InfrastructureInventory;
