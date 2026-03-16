"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { getRoles } from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { useStyles } from "@/app/style/style";
import { IRoleListItem } from "@/interfaces/auth/adminService";
import { PERMISSIONS } from "@/constants/auth/roles";

const { Paragraph, Title } = Typography;

const RolesPageContent = () => {
  const { styles } = useStyles();
  const [roles, setRoles] = useState<IRoleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void getRoles()
      .then((result) => {
        setRoles(toArray(result.items));
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load roles.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AppShell
      title="Access Control"
      subtitle="Review the privileged roles and permission bundles that shape how DataSentinel is accessed."
    >
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          className={styles.alert}
        />
      ) : null}

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Role and privilege catalogue
        </Title>
        <Paragraph className={styles.sectionLead}>
          This temporary control view highlights built-in administrator roles such as `Host.Admin` and `Tenants.Admin`, plus any tenant-scoped roles returned by the backend.
        </Paragraph>
        <Table<IRoleListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={roles}
          className={styles.table}
          columns={[
            {
              title: "Role profile",
              dataIndex: "displayName",
              key: "displayName",
              render: (_, record) => (
                <>
                  <strong>{record.displayName}</strong>
                  <div>{record.name}</div>
                </>
              ),
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              render: (value?: string | null) => value || "No description",
            },
            {
              title: "Security flags",
              key: "flags",
              render: (_, record) => (
                <>
                  {record.isStatic ? <Tag color="blue">Static</Tag> : null}
                  {record.isDefault ? <Tag color="green">Default</Tag> : null}
                </>
              ),
            },
            {
              title: "Created",
              dataIndex: "creationTime",
              key: "creationTime",
              render: (value?: string | null) => formatDateTime(value),
            },
            {
              title: "Permission count",
              dataIndex: "grantedPermissions",
              key: "grantedPermissions",
              render: (permissions?: string[] | null) => toArray(permissions).length,
            },
          ]}
          pagination={false}
        />
      </Card>
    </AppShell>
  );
};

export default withAuth(RolesPageContent, PERMISSIONS.roles);
