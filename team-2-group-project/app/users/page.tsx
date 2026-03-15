"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { getUsers, IUserListItem } from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { PERMISSIONS } from "@/utils/roles";
import { useStyles } from "@/app/style/style";

const { Paragraph, Title } = Typography;

const UsersPageContent = () => {
  const { styles } = useStyles();
  const [users, setUsers] = useState<IUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void getUsers()
      .then((result) => {
        setUsers(toArray(result.items));
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load users.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AppShell
      title="Users"
      subtitle="Permission-gated to the same ABP users surface used by the Angular app."
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
          Tenant users
        </Title>
        <Paragraph className={styles.sectionLead}>
          This page is available only when `{PERMISSIONS.users}` is granted.
        </Paragraph>
        <Table<IUserListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={users}
          className={styles.table}
          columns={[
            {
              title: "User",
              dataIndex: "fullName",
              key: "fullName",
              render: (_, record) => (
                <>
                  <strong>{record.fullName || `${record.name} ${record.surname}`}</strong>
                  <div>{record.userName}</div>
                </>
              ),
            },
            {
              title: "Email",
              dataIndex: "emailAddress",
              key: "emailAddress",
            },
            {
              title: "Status",
              dataIndex: "isActive",
              key: "isActive",
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  {isActive ? "Active" : "Disabled"}
                </Tag>
              ),
            },
            {
              title: "Roles",
              dataIndex: "roleNames",
              key: "roleNames",
              render: (roleNames?: string[] | null) =>
                toArray(roleNames).length ? (
                  toArray(roleNames).map((role) => (
                    <Tag key={role}>{role}</Tag>
                  ))
                ) : (
                  <span>No roles</span>
                ),
            },
            {
              title: "Last login",
              dataIndex: "lastLoginTime",
              key: "lastLoginTime",
              render: (value?: string | null) => formatDateTime(value),
            },
          ]}
          pagination={false}
        />
      </Card>
    </AppShell>
  );
};

export default withAuth(UsersPageContent, PERMISSIONS.users);
