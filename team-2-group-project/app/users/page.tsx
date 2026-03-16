"use client";

import { useEffect, useState } from "react";
import { Alert, Card, Table, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { getUsers } from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { useStyles } from "@/app/style/style";
import { IUserListItem } from "@/interfaces/auth/adminService";
import { PERMISSIONS } from "@/constants/auth/roles";

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
      title="Identities"
      subtitle="Review the user identities currently visible in this tenant-aware monitoring workspace."
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
          Monitored user identities
        </Title>
        <Paragraph className={styles.sectionLead}>
          This temporary analyst view is available only when `{PERMISSIONS.users}` is granted and helps verify who can access the current environment.
        </Paragraph>
        <Table<IUserListItem>
          rowKey="id"
          loading={isLoading}
          dataSource={users}
          className={styles.table}
          columns={[
            {
              title: "Identity",
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
              title: "Access state",
              dataIndex: "isActive",
              key: "isActive",
              render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                  {isActive ? "Active" : "Disabled"}
                </Tag>
              ),
            },
            {
              title: "Assigned roles",
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
              title: "Last activity",
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
