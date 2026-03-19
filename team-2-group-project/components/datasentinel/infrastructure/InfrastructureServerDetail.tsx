"use client";

import Link from "next/link";
import { Alert, Button, Card, Descriptions, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { IMonitoredDatabaseListItem } from "@/interfaces/datasentinel/monitoring";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";
import { formatDateTime, toArray } from "@/utils/helpers";

const InfrastructureServerDetail = ({ serverId }: { serverId: string }) => {
  const { styles } = useStyles();
  const { allDatabases, isLoading, servers } = useMonitoringInfrastructureState();
  const server = servers.find((item) => item.id === serverId);

  if (!server && !isLoading) {
    return (
      <Alert
        type="warning"
        showIcon
        title="That monitored server could not be found for the current tenant."
      />
    );
  }

  if (!server) {
    return null;
  }

  const relatedDatabases = allDatabases.filter((database) => database.serverId === server.id);

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
    <div className={styles.stackedCards}>
      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          {server.name}
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Drill through the databases hosted on this monitored server.
        </Typography.Paragraph>

        <div className={styles.detailGrid}>
          <div className={styles.detailPanel}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Host name">{server.hostName}</Descriptions.Item>
              <Descriptions.Item label="Environment">{server.environment}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={server.isEnabled ? "green" : "default"}>
                  {server.isEnabled ? "Enabled" : "Disabled"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className={styles.detailPanel}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Databases">{relatedDatabases.length}</Descriptions.Item>
              <Descriptions.Item label="Last heartbeat">
                {formatDateTime(server.lastHeartbeatAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {server.description || "No description provided."}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Related Databases
        </Typography.Title>
        <Table<IMonitoredDatabaseListItem>
          rowKey="id"
          dataSource={relatedDatabases}
          columns={columns}
          className={styles.table}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default InfrastructureServerDetail;
