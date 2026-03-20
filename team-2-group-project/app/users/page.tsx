"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import AppShell from "@/components/auth/AppShell";
import TimedAlertMessage from "@/components/feedback/TimedAlertMessage";
import { withAuth } from "@/hoc/withAuth";
import { useAuthState } from "@/providers/authProvider";
import { useAdminState, useAdminActions } from "@/providers/adminProvider";
import {
  createUser,
  deleteUser,
  activateUser,
  deActivateUser,
  getUser,
  resetPassword,
  updateUser,
} from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { useStyles } from "@/app/style/style";
import {
  ICreateUserDto,
  IResetPasswordDto,
  IUserDto,
  IUserListItem,
} from "@/interfaces/auth/adminService";
import { PERMISSIONS } from "@/constants/auth/roles";
import { resolveAbpErrorMessage } from "@/utils/abp";
import {
  canActivateUsers,
  canManageUsersCrud,
} from "@/utils/auth/roles";

const { Paragraph, Title } = Typography;

const UsersPageContent = () => {
  const { styles } = useStyles();
  const { permissions, user } = useAuthState();
  const {
    users,
    isLoadingUsers,
    assignableRoles,
    errorMessage,
    actionMessage,
  } =
    useAdminState();
  const { fetchUsers, fetchAssignableRoles, setActionMessage, clearMessages } =
    useAdminActions();
  const canManageUsers = canManageUsersCrud(user?.roles, permissions);
  const canToggleUserActivation = canActivateUsers(permissions);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [assignRolesForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignRolesOpen, setIsAssignRolesOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserListItem | null>(null);
  const [assigningRolesUser, setAssigningRolesUser] = useState<IUserDto | null>(
    null,
  );
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoleAssignment, setIsLoadingRoleAssignment] = useState(false);
  const [processingDeleteId, setProcessingDeleteId] = useState<number | null>(null);
  const [processingToggleId, setProcessingToggleId] = useState<number | null>(null);
  const [assignLoadingUserId, setAssignLoadingUserId] = useState<number | null>(null);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  useEffect(() => {
    void fetchUsers();
    void fetchAssignableRoles();
  }, [fetchAssignableRoles, fetchUsers]);

  const roleOptions = assignableRoles.map((r) => ({
    value: r.name ?? "",
    label: r.displayName ?? r.name ?? "",
  }));

  const handleCreate = async (values: ICreateUserDto) => {
    if (!canManageUsers) return;
    setIsSubmitting(true);
    try {
      await createUser(values);
      setActionMessage({ type: "success", text: "User created successfully." });
      setIsCreateOpen(false);
      createForm.resetFields();
      void fetchUsers();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to create user."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: Omit<IUserDto, "id">) => {
    if (!editingUser || !canManageUsers) return;
    setIsSubmitting(true);
    try {
      await updateUser({ ...values, id: editingUser.id });
      setActionMessage({ type: "success", text: "User updated successfully." });
      setIsEditOpen(false);
      void fetchUsers();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to update user."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageUsers) return;
    setProcessingDeleteId(id);
    setIsRefreshingList(true);
    try {
      await deleteUser(id);
      setActionMessage({ type: "success", text: "User deleted." });
      await fetchUsers();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to delete user."),
      });
    } finally {
      setProcessingDeleteId(null);
      setIsRefreshingList(false);
    }
  };

  const handleToggleActive = async (user: IUserListItem) => {
    if (!canToggleUserActivation) return;
    setProcessingToggleId(user.id);
    try {
      if (user.isActive) {
        await deActivateUser(user.id);
        setActionMessage({
          type: "success",
          text: `${user.userName} deactivated.`,
        });
      } else {
        await activateUser(user.id);
        setActionMessage({
          type: "success",
          text: `${user.userName} activated.`,
        });
      }
      void fetchUsers();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to change user status."),
      });
    } finally {
      setProcessingToggleId(null);
    }
  };

  const handleResetPassword = async (
    values: Omit<IResetPasswordDto, "userId">,
  ) => {
    if (!resetUserId || !canManageUsers) return;
    setIsSubmitting(true);
    try {
      await resetPassword({ ...values, userId: resetUserId });
      setActionMessage({
        type: "success",
        text: "Password reset successfully.",
      });
      setIsResetOpen(false);
      resetForm.resetFields();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to reset password."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRoles = async (values: { roleNames?: string[] | null }) => {
    if (!assigningRolesUser || !canManageUsers) return;

    setIsSubmitting(true);
    try {
      await updateUser({
        ...assigningRolesUser,
        roleNames: values.roleNames ?? [],
      });
      setActionMessage({
        type: "success",
        text: "User roles updated successfully.",
      });
      setIsAssignRolesOpen(false);
      assignRolesForm.resetFields();
      setAssigningRolesUser(null);
      void fetchUsers();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to update user roles."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (user: IUserListItem) => {
    if (!canManageUsers) return;
    setEditingUser(user);
    editForm.setFieldsValue({
      userName: user.userName,
      name: user.name,
      surname: user.surname,
      emailAddress: user.emailAddress,
      isActive: user.isActive,
      roleNames: toArray(user.roleNames),
    });
    setIsEditOpen(true);
  };

  const openAssignRoles = async (user: IUserListItem) => {
    if (!canManageUsers) return;

    setAssignLoadingUserId(user.id);
    setIsLoadingRoleAssignment(true);
    setIsAssignRolesOpen(true);

    try {
      const userDetail = await getUser(user.id);
      setAssigningRolesUser(userDetail);
      assignRolesForm.setFieldsValue({
        roleNames: toArray(userDetail.roleNames),
      });
    } catch {
      const fallbackUser: IUserDto = {
        id: user.id,
        userName: user.userName,
        name: user.name,
        surname: user.surname,
        emailAddress: user.emailAddress,
        isActive: user.isActive,
        fullName: user.fullName,
        lastLoginTime: user.lastLoginTime,
        creationTime: user.creationTime,
        roleNames: toArray(user.roleNames),
      };

      setAssigningRolesUser(fallbackUser);
      assignRolesForm.setFieldsValue({
        roleNames: toArray(user.roleNames),
      });
    } finally {
      setIsLoadingRoleAssignment(false);
      setAssignLoadingUserId(null);
    }
  };

  const openReset = (userId: number) => {
    if (!canManageUsers) return;
    setResetUserId(userId);
    resetForm.resetFields();
    setIsResetOpen(true);
  };

  return (
    <AppShell
      title="Users"
      subtitle="Manage user accounts and access within the active tenant or host context."
    >
      {/* User feedback: error state */}
      {errorMessage ? (
        <TimedAlertMessage
          type="error"
          title={errorMessage}
          onDismiss={clearMessages}
          className={styles.alert}
        />
      ) : null}
      {actionMessage ? (
        <TimedAlertMessage
          type={actionMessage.type}
          title={actionMessage.text}
          className={styles.alert}
          onDismiss={clearMessages}
        />
      ) : null}

      <Card className={styles.pageCard}>
        {/* User feedback: loading state handled by Table's loading prop */}
        <div className={styles.cardToolbar}>
          <Title level={4} className={styles.sectionTitle}>
            Tenant users
          </Title>
          {canManageUsers ? (
            <Button
              type="primary"
              onClick={() => {
                createForm.resetFields();
                setIsCreateOpen(true);
              }}
            >
              Create user
            </Button>
          ) : null}
        </div>
        <Paragraph className={styles.sectionLead}>
          This page is available only when `{PERMISSIONS.users}` is granted.
        </Paragraph>
        <Table<IUserListItem>
          rowKey="id"
          loading={isLoadingUsers || isRefreshingList}
          dataSource={users}
          className={styles.table}
          columns={[
            {
              title: "User",
                key: "user",
                render: (_, record) => (
                  <>
                    <strong>
                      {record.fullName || `${record.name} ${record.surname}`}
                      {(processingDeleteId === record.id || processingToggleId === record.id || assignLoadingUserId === record.id) ? (
                        <LoadingOutlined spin style={{ marginLeft: 8, color: "#ff4d4f", fontSize: 12 }} />
                      ) : null}
                    </strong>
                    <div className={styles.cellHint}>{record.userName}</div>
                  </>
                ),
            },
            {
              title: "Email",
              dataIndex: "emailAddress",
              key: "emailAddress",
              render: (value: string) => value,
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
                  toArray(roleNames).map((role) => <Tag key={role}>{role}</Tag>)
                ) : (
                  <span className={styles.mutedText}>No roles</span>
                ),
            },
            {
              title: "Last login",
              dataIndex: "lastLoginTime",
              key: "lastLoginTime",
              render: (value?: string | null) => formatDateTime(value),
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) =>
                canManageUsers || canToggleUserActivation ? (
                  <Space size="small" wrap>
                    {canManageUsers ? (
                      <Button size="small" onClick={() => openEdit(record)}>
                        Edit
                      </Button>
                    ) : null}
                    {canManageUsers ? (
                      <Button
                        size="small"
                        onClick={() => void openAssignRoles(record)}
                        loading={assignLoadingUserId === record.id && isLoadingRoleAssignment}
                      >
                        Assign roles
                      </Button>
                    ) : null}
                    {canToggleUserActivation ? (
                      <Button
                        size="small"
                        onClick={() => void handleToggleActive(record)}
                        loading={processingToggleId === record.id}
                      >
                        {record.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    ) : null}
                    {canManageUsers ? (
                      <Button size="small" onClick={() => openReset(record.id)}>
                        Reset password
                      </Button>
                    ) : null}
                    {canManageUsers ? (
                      <Popconfirm
                        title="Delete user"
                        description="This action cannot be undone."
                        onConfirm={() => void handleDelete(record.id)}
                        okText="Delete"
                        okButtonProps={{ danger: true, loading: processingDeleteId === record.id }}
                      >
                        <Button size="small" danger>
                          Delete
                        </Button>
                      </Popconfirm>
                    ) : null}
                  </Space>
                ) : (
                  <span className={styles.mutedText}>View only</span>
                ),
            },
          ]}
          pagination={false}
        />
      </Card>

      <Modal
        title="Create user"
        open={canManageUsers && isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Create"
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ isActive: true }}
        >
          <Form.Item name="name" label="First name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Last name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="userName"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emailAddress"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="roleNames" label="Roles">
            <Select
              mode="multiple"
              options={roleOptions}
              placeholder="Select roles"
            />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit user"
        open={canManageUsers && isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => editForm.submit()}
        okText="Save"
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="name" label="First name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Last name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="userName"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emailAddress"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          assigningRolesUser
            ? `Assign roles: ${assigningRolesUser.userName}`
            : "Assign roles"
        }
        open={canManageUsers && isAssignRolesOpen}
        onCancel={() => {
          setIsAssignRolesOpen(false);
          setAssigningRolesUser(null);
        }}
        onOk={() => assignRolesForm.submit()}
        okText="Save roles"
        confirmLoading={isSubmitting || isLoadingRoleAssignment}
        destroyOnHidden
      >
        <Form
          form={assignRolesForm}
          layout="vertical"
          onFinish={handleAssignRoles}
        >
          <Form.Item name="roleNames" label="Assigned roles">
            <Select
              mode="multiple"
              options={roleOptions}
              placeholder="Select roles"
              loading={isLoadingRoleAssignment}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reset password"
        open={canManageUsers && isResetOpen}
        onCancel={() => setIsResetOpen(false)}
        onOk={() => resetForm.submit()}
        okText="Reset"
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form
          form={resetForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="adminPassword"
            label="Your admin password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New password for user"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  );
};

export default withAuth(UsersPageContent, PERMISSIONS.users);
