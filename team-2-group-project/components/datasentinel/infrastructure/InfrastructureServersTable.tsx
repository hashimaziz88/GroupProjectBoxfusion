"use client";

import Link from "next/link";
import { Button, Card, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { IMonitoredServerListItem } from "@/interfaces/datasentinel/monitoring";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";
import { formatDateTime, toArray } from "@/utils/helpers";

const InfrastructureServersTable = () => {
  const { styles } = useStyles();
  const { isLoading, servers } = useMonitoringInfrastructureState();

  const columns = [
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
    {
      title: "Drill down",
      key: "detail",
      render: (_: unknown, record: IMonitoredServerListItem) => (
        <Link href={`/datasentinel/infrastructure/servers/${record.id}`}>
          <Button type="link">View server</Button>
        </Link>
      ),
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Monitored Servers
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Browse monitored servers first, then drill into their related databases.
      </Typography.Paragraph>

      <Table<IMonitoredServerListItem>
        rowKey="id"
        loading={isLoading}
        dataSource={servers}
        columns={columns}
        className={styles.table}
        pagination={false}
      />
    </Card>
  );
};

export default InfrastructureServersTable;
