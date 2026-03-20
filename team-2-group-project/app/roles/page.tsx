"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { useAuthState } from "@/providers/authProvider";
import { useAdminState, useAdminActions } from "@/providers/adminProvider";
import {
  createRole,
  updateRole,
  deleteRole,
  getRoleForEdit,
} from "@/utils/auth/adminService";
import { formatDateTime, toArray } from "@/utils/helpers";
import { useStyles } from "@/app/style/style";
import {
  ICreateRoleDto,
  IRoleDto,
  IRoleListItem,
} from "@/interfaces/auth/adminService";
import { PERMISSIONS } from "@/constants/auth/roles";
import { canManageRolesCrud } from "@/utils/auth/roles";

const { Paragraph, Title } = Typography;

const RolesPageContent = () => {
  const { styles } = useStyles();
  const { permissions, user } = useAuthState();
  const { roles, isLoadingRoles, allPermissions, errorMessage, actionMessage } =
    useAdminState();
  const { fetchRoles, fetchAllPermissions, setActionMessage } =
    useAdminActions();
  const canManageRoles = canManageRolesCrud(user?.roles, permissions);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IRoleListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  useEffect(() => {
    void fetchRoles();
    void fetchAllPermissions();
  }, [fetchRoles, fetchAllPermissions]);

  const permissionOptions = allPermissions.map((p) => ({
    value: p.name ?? "",
    label: p.displayName ?? p.name ?? "",
  }));

  const handleCreate = async (values: ICreateRoleDto) => {
    if (!canManageRoles) return;
    setIsSubmitting(true);
    try {
      await createRole(values);
      setActionMessage({ type: "success", text: "Role created successfully." });
      setIsCreateOpen(false);
      createForm.resetFields();
      void fetchRoles();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create role.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: Omit<IRoleDto, "id">) => {
    if (!editingRole || !canManageRoles) return;
    setIsSubmitting(true);
    try {
      await updateRole({ ...values, id: editingRole.id });
      setActionMessage({ type: "success", text: "Role updated successfully." });
      setIsEditOpen(false);
      void fetchRoles();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update role.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageRoles) return;
    try {
      await deleteRole(id);
      setActionMessage({ type: "success", text: "Role deleted." });
      void fetchRoles();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete role.",
      });
    }
  };

  const openEdit = async (role: IRoleListItem) => {
    if (!canManageRoles) return;
    setEditingRole(role);
    setIsLoadingEdit(true);
    setIsEditOpen(true);
    try {
      const result = await getRoleForEdit(role.id);
      editForm.setFieldsValue({
        name: result.role?.name ?? role.name,
        displayName: result.role?.displayName ?? role.displayName,
        description: result.role?.description ?? role.description,
        grantedPermissions: toArray(result.grantedPermissionNames),
      });
    } catch {
      editForm.setFieldsValue({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        grantedPermissions: toArray(role.grantedPermissions),
      });
    } finally {
      setIsLoadingEdit(false);
    }
  };

  return (
    <AppShell
      title="Roles"
      subtitle="Define roles and assign permissions to control what users can access within a tenant."
    >
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          className={styles.alert}
        />
      ) : null}
      {actionMessage ? (
        <Alert
          type={actionMessage.type}
          showIcon
          title={actionMessage.text}
          className={styles.alert}
          closable={{ onClose: () => setActionMessage(null) }}
        />
      ) : null}

      <Card className={styles.pageCard}>
        <div className={styles.cardToolbar}>
          <Title level={4} className={styles.sectionTitle}>
            Role catalogue
          </Title>
          {canManageRoles ? (
            <Button
              type="primary"
              onClick={() => {
                createForm.resetFields();
                setIsCreateOpen(true);
              }}
            >
              Create role
            </Button>
          ) : null}
        </div>
        <Paragraph className={styles.sectionLead}>
          The backend provides static roles such as `Host.Admin` and
          `Tenants.Admin`, plus any custom roles defined in the tenant scope.
          Static roles cannot be deleted.
        </Paragraph>
        <Table<IRoleListItem>
          rowKey="id"
          loading={isLoadingRoles}
          dataSource={roles}
          className={styles.table}
          columns={[
            {
              title: "Role",
              key: "role",
              render: (_, record) => (
                <>
                  <strong>{record.displayName}</strong>
                  <div className={styles.cellHint}>{record.name}</div>
                </>
              ),
            },
            {
              title: "Description",
              dataIndex: "description",
              key: "description",
              render: (value?: string | null) => (
                <span className={value ? undefined : styles.mutedText}>
                  {value || "No description"}
                </span>
              ),
            },
            {
              title: "Flags",
              key: "flags",
              render: (_, record) => (
                <>
                  {record.isStatic ? (
                    <Tag color="blue">Static</Tag>
                  ) : null}
                  {record.isDefault ? (
                    <Tag color="green">Default</Tag>
                  ) : null}
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
              render: (permissions?: string[] | null) =>
                toArray(permissions).length,
            },
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                canManageRoles ? (
                  <Space size="small" wrap>
                    <Button size="small" onClick={() => void openEdit(record)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete role"
                      description={
                        record.isStatic
                          ? "Static roles cannot be deleted."
                          : "This action cannot be undone."
                      }
                      onConfirm={() =>
                        record.isStatic ? undefined : void handleDelete(record.id)
                      }
                      okText="Delete"
                      okButtonProps={{ danger: true, disabled: record.isStatic }}
                    >
                      <Button size="small" danger disabled={record.isStatic}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                ) : (
                  <span className={styles.mutedText}>View only</span>
                )
              ),
            },
          ]}
          pagination={false}
        />
      </Card>

      <Modal
        title="Create role"
        open={canManageRoles && isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Create"
        confirmLoading={isSubmitting}
        destroyOnHidden
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. DataViewer" />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="Display name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Data Viewer" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="grantedPermissions" label="Permissions">
            <Checkbox.Group
              options={permissionOptions}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit role"
        open={canManageRoles && isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => editForm.submit()}
        okText="Save"
        confirmLoading={isSubmitting || isLoadingEdit}
        destroyOnHidden
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="Display name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="grantedPermissions" label="Permissions">
            <Checkbox.Group
              options={permissionOptions}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  );
};

export default withAuth(RolesPageContent, PERMISSIONS.roles);
