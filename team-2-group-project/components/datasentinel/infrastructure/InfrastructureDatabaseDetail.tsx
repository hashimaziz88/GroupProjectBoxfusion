"use client";

import Link from "next/link";
import { Alert, Button, Card, Descriptions, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { IMonitoredTableListItem } from "@/interfaces/datasentinel/monitoring";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";
import { resolveServerName } from "@/utils/datasentinel/infrastructureHelpers";
import { formatDateTime } from "@/utils/helpers";

const InfrastructureDatabaseDetail = ({ databaseId }: { databaseId: string }) => {
  const { styles } = useStyles();
  const { allDatabases, allTables, isLoading, servers } =
    useMonitoringInfrastructureState();
  const database = allDatabases.find((item) => item.id === databaseId);

  if (!database && !isLoading) {
    return (
      <Alert
        type="warning"
        showIcon
        title="That monitored database could not be found for the current tenant."
      />
    );
  }

  if (!database) {
    return null;
  }

  const relatedTables = allTables.filter((table) => table.databaseId === database.id);

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

  return (
    <div className={styles.stackedCards}>
      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          {database.name}
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          Inspect this monitored database and drill further into the table
          references linked beneath it.
        </Typography.Paragraph>

        <div className={styles.detailGrid}>
          <div className={styles.detailPanel}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Engine">{database.engine}</Descriptions.Item>
              <Descriptions.Item label="Server">
                <Link href={`/datasentinel/infrastructure/servers/${database.serverId}`}>
                  {resolveServerName(servers, database.serverId)}
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={database.isEnabled ? "green" : "default"}>
                  {database.isEnabled ? "Enabled" : "Disabled"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className={styles.detailPanel}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tables">{relatedTables.length}</Descriptions.Item>
              <Descriptions.Item label="Last activity">
                {formatDateTime(database.lastActivityAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {database.description || "No description provided."}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>

      <Card className={styles.pageCard}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          Related Tables
        </Typography.Title>
        <Table<IMonitoredTableListItem>
          rowKey="id"
          dataSource={relatedTables}
          columns={columns}
          className={styles.table}
          scroll={{ x: "max-content" }}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default InfrastructureDatabaseDetail;
