"use client";

import Link from "next/link";
import { Button, Card, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";

const InfrastructureDirectory = () => {
  const { styles } = useStyles();
  const { allDatabases, allTables, servers } = useMonitoringInfrastructureState();

  const items = [
    {
      key: "servers",
      title: "Servers",
      href: "/datasentinel/infrastructure/servers",
      count: servers.length,
      lead:
        "View monitored server nodes, inspect their database footprint, and drill into the databases they host.",
    },
    {
      key: "databases",
      title: "Databases",
      href: "/datasentinel/infrastructure/databases",
      count: allDatabases.length,
      lead:
        "Browse tenant databases independently, then drill into the tables modeled for each monitored database.",
    },
    {
      key: "tables",
      title: "Tables",
      href: "/datasentinel/infrastructure/tables",
      count: allTables.length,
      lead:
        "Inspect table-level references directly when you need object-level monitoring and intake context.",
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Infrastructure Explorer
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Use the routed explorer below to move between server, database, and table
        inventories with proper drill-down pages instead of one flattened list.
      </Typography.Paragraph>

      <div className={styles.directoryGrid}>
        {items.map((item) => (
          <div key={item.key} className={styles.directoryCard}>
            <div className={styles.directoryTitle}>{item.title}</div>
            <div className={styles.directoryCount}>{item.count}</div>
            <div className={styles.directoryLead}>{item.lead}</div>
            <Link href={item.href}>
              <Button type="primary">Open {item.title.toLowerCase()}</Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InfrastructureDirectory;
