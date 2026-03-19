"use client";

import Link from "next/link";
import { Button, Card, Select, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { IMonitoredDatabaseListItem } from "@/interfaces/datasentinel/monitoring";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import { resolveServerName } from "@/utils/datasentinel/infrastructureHelpers";
import { formatDateTime, toArray } from "@/utils/helpers";

const InfrastructureDatabasesTable = () => {
  const { styles } = useStyles();
  const {
    allDatabases,
    databaseItems,
    isDatabaseLoading,
    selectedServerId,
    servers,
  } = useMonitoringInfrastructureState();
  const { setSelectedServerId } = useMonitoringInfrastructureActions();

  const columns = [
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
      key: "server",
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
    {
      title: "Drill down",
      key: "detail",
      render: (_: unknown, record: IMonitoredDatabaseListItem) => (
        <Link href={`/datasentinel/infrastructure/databases/${record.id}`}>
          <Button type="link">View database</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <div className={styles.cardToolbar}>
        <div>
          <Typography.Title level={4} className={styles.sectionTitle}>
            Monitored Databases
          </Typography.Title>
          <Typography.Paragraph className={styles.sectionLead}>
            Filter by server when needed, then drill into a specific database to
            see its table references.
          </Typography.Paragraph>
        </div>

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
      </div>

      <Table<IMonitoredDatabaseListItem>
        rowKey="id"
        loading={isDatabaseLoading}
        dataSource={selectedServerId ? databaseItems : allDatabases}
        columns={columns}
        className={styles.table}
        pagination={false}
      />
    </Card>
  );
};

export default InfrastructureDatabasesTable;
