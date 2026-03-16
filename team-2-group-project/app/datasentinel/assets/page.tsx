"use client";

import { useEffect, useEffectEvent } from "react";
import { Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { IMonitoredDatabase, IMonitoredServer } from "@/interfaces/datasentinel";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const AssetsPageContent = () => {
  const { styles } = useStyles();
  const {
    monitoredServers,
    monitoredDatabases,
    isAssetsPending,
    errorMessage,
  } = useDataSentinelState();
  const { loadAssets } = useDataSentinelActions();

  const loadAssetsOnMount = useEffectEvent(async () => {
    await loadAssets();
  });

  useEffect(() => {
    void loadAssetsOnMount();
  }, []);

  const servers = toArray(monitoredServers);
  const databases = toArray(monitoredDatabases);

  return (
    <AppShell
      title="Servers & Databases"
      subtitle="View the monitored PostgreSQL assets attached to the current tenant workspace."
    >
      <QueryState
        isLoading={isAssetsPending}
        errorMessage={errorMessage}
        isEmpty={!servers.length && !databases.length}
        emptyDescription="No monitored assets are available yet."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          <Card className={styles.pageCard}>
            <Title level={4} className={styles.sectionTitle}>
              Monitored servers
            </Title>
            <Paragraph className={styles.sectionLead}>
              Source environments available to the monitoring generator and JSON import flow.
            </Paragraph>
            <Table<IMonitoredServer>
              rowKey="id"
              pagination={false}
              dataSource={servers}
              className={styles.table}
              columns={[
                {
                  title: "Server",
                  key: "name",
                  render: (_, record) => (
                    <div>
                      <div style={{ fontWeight: 700 }}>{record.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{record.hostName}</div>
                    </div>
                  ),
                },
                {
                  title: "Environment",
                  dataIndex: "environmentName",
                  key: "environmentName",
                },
                {
                  title: "Region",
                  dataIndex: "region",
                  key: "region",
                },
                {
                  title: "State",
                  dataIndex: "isActive",
                  key: "isActive",
                  render: (value: boolean) => (
                    <Tag color={value ? "green" : "default"}>
                      {value ? "Active" : "Inactive"}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>

          <Card className={styles.pageCard}>
            <Title level={4} className={styles.sectionTitle}>
              Monitored databases
            </Title>
            <Paragraph className={styles.sectionLead}>
              Tenant-scoped database assets that can be targeted by simulated or imported activity.
            </Paragraph>
            <Table<IMonitoredDatabase>
              rowKey="id"
              pagination={false}
              dataSource={databases}
              className={styles.table}
              columns={[
                {
                  title: "Database",
                  key: "name",
                  render: (_, record) => (
                    <div>
                      <div style={{ fontWeight: 700 }}>{record.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{record.serverName}</div>
                    </div>
                  ),
                },
                {
                  title: "Engine",
                  dataIndex: "engine",
                  key: "engine",
                },
                {
                  title: "Owner",
                  dataIndex: "owner",
                  key: "owner",
                },
                {
                  title: "State",
                  dataIndex: "isActive",
                  key: "isActive",
                  render: (value: boolean) => (
                    <Tag color={value ? "green" : "default"}>
                      {value ? "Active" : "Inactive"}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </QueryState>
    </AppShell>
  );
};

export default withAuth(AssetsPageContent, PERMISSIONS.datasentinelDashboard);
