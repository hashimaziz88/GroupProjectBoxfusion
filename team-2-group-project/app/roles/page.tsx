"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { getRoles, IRoleListItem } from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { PERMISSIONS } from "@/utils/roles";
import { useStyles } from "@/app/style/style";

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
      title="Roles"
      subtitle="This route reflects the Angular administration menu and only opens when the ABP role permission is granted."
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
          Role catalogue
        </Title>
        <Paragraph className={styles.sectionLead}>
          The backend provides static roles such as `Host.Admin` and `Tenants.Admin`, plus any custom roles defined in the tenant scope.
        </Paragraph>
        <Table<IRoleListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={roles}
          className={styles.table}
          columns={[
            {
              title: "Role",
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
              title: "Flags",
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
              title: "Permissions",
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
