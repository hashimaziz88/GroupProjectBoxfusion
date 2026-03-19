"use client";

import Link from "next/link";
import { Button, Card, Select, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { IMonitoredTableListItem } from "@/interfaces/datasentinel/monitoring";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import {
  resolveDatabaseName,
  resolveServerName,
} from "@/utils/datasentinel/infrastructureHelpers";
import { formatDateTime } from "@/utils/helpers";

const InfrastructureTablesTable = () => {
  const { styles } = useStyles();
  const {
    allDatabases,
    availableDatabases,
    allTables,
    isTableLoading,
    selectedDatabaseId,
    selectedServerId,
    servers,
    tableItems,
  } = useMonitoringInfrastructureState();
  const { setSelectedDatabaseId, setSelectedServerId } =
    useMonitoringInfrastructureActions();

  const columns = [
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
      key: "database",
      render: (_: unknown, record: IMonitoredTableListItem) =>
        resolveDatabaseName(allDatabases, record.databaseId),
    },
    {
      title: "Server",
      key: "server",
      render: (_: unknown, record: IMonitoredTableListItem) => {
        const database = allDatabases.find((item) => item.id === record.databaseId);
        return database ? resolveServerName(servers, database.serverId) : "Unknown server";
      },
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
    {
      title: "Drill down",
      key: "detail",
      render: (_: unknown, record: IMonitoredTableListItem) => (
        <Link href={`/datasentinel/infrastructure/tables/${record.id}`}>
          <Button type="link">View table</Button>
        </Link>
      ),
    },
  ];

  const dataSource =
    selectedDatabaseId || selectedServerId ? tableItems : allTables;

  return (
    <Card className={styles.pageCard}>
      <div className={styles.cardToolbar}>
        <div>
          <Typography.Title level={4} className={styles.sectionTitle}>
            Monitored Tables
          </Typography.Title>
          <Typography.Paragraph className={styles.sectionLead}>
            Narrow by server or database, then drill into a specific table
            reference when you need object-level context.
          </Typography.Paragraph>
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
        </div>
      </div>

      <Table<IMonitoredTableListItem>
        rowKey="id"
        loading={isTableLoading}
        dataSource={dataSource}
        columns={columns}
        className={styles.table}
        pagination={false}
      />
    </Card>
  );
};

export default InfrastructureTablesTable;
