"use client";

import Link from "next/link";
import { Alert, Card, Descriptions, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";
import {
  resolveDatabaseName,
  resolveServerName,
} from "@/utils/datasentinel/infrastructureHelpers";
import { formatDateTime } from "@/utils/helpers";

const InfrastructureTableDetail = ({ tableId }: { tableId: string }) => {
  const { styles } = useStyles();
  const { allDatabases, allTables, isLoading, servers } =
    useMonitoringInfrastructureState();
  const table = allTables.find((item) => item.id === tableId);

  if (!table && !isLoading) {
    return (
      <Alert
        type="warning"
        showIcon
        title="That monitored table could not be found for the current tenant."
      />
    );
  }

  if (!table) {
    return null;
  }

  const database = allDatabases.find((item) => item.id === table.databaseId);

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        {table.schemaName}.{table.name}
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Object-level monitoring reference details for this table.
      </Typography.Paragraph>

      <div className={styles.detailGrid}>
        <div className={styles.detailPanel}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Schema">{table.schemaName}</Descriptions.Item>
            <Descriptions.Item label="Table name">{table.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={table.isEnabled ? "green" : "default"}>
                {table.isEnabled ? "Enabled" : "Disabled"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div className={styles.detailPanel}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Database">
              {database ? (
                <Link href={`/datasentinel/infrastructure/databases/${database.id}`}>
                  {resolveDatabaseName(allDatabases, database.id)}
                </Link>
              ) : (
                "Unknown database"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Server">
              {database ? (
                <Link href={`/datasentinel/infrastructure/servers/${database.serverId}`}>
                  {resolveServerName(servers, database.serverId)}
                </Link>
              ) : (
                "Unknown server"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Last activity">
              {formatDateTime(table.lastActivityAt)}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <Card className={styles.pageCard} style={{ marginTop: 18 }}>
        <Typography.Title level={5} className={styles.sectionTitle}>
          Description
        </Typography.Title>
        <Typography.Paragraph className={styles.sectionLead}>
          {table.description || "No table description has been provided yet."}
        </Typography.Paragraph>
      </Card>
    </Card>
  );
};

export default InfrastructureTableDetail;
