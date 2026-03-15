"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { getTenants, ITenantListItem } from "@/utils/auth/adminService";
import { toArray } from "@/utils/helpers";
import { PERMISSIONS } from "@/utils/roles";
import { useStyles } from "@/app/style/style";

const { Paragraph, Title } = Typography;

const TenantsPageContent = () => {
  const { styles } = useStyles();
  const [tenants, setTenants] = useState<ITenantListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void getTenants()
      .then((result) => {
        setTenants(toArray(result.items));
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load tenants.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AppShell
      title="Tenants"
      subtitle="Host-level tenant administration, matching the Angular app's host management route."
    >
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          message={errorMessage}
          className={styles.alert}
        />
      ) : null}

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Tenant directory
        </Title>
        <Paragraph className={styles.sectionLead}>
          This route is available only when `{PERMISSIONS.tenants}` is granted, which typically means host admin access.
        </Paragraph>
        <Table<ITenantListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={tenants}
          className={styles.table}
          columns={[
            {
              title: "Tenant",
              dataIndex: "name",
              key: "name",
              render: (_, record) => (
                <>
                  <strong>{record.name}</strong>
                  <div>{record.tenancyName}</div>
                </>
              ),
            },
            {
              title: "ID",
              dataIndex: "id",
              key: "id",
            },
            {
              title: "Status",
              dataIndex: "isActive",
              key: "isActive",
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  {isActive ? "Active" : "Inactive"}
                </Tag>
              ),
            },
          ]}
          pagination={false}
        />
      </Card>
    </AppShell>
  );
};

export default withAuth(TenantsPageContent, PERMISSIONS.tenants);
