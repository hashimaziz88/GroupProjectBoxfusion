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
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import AppShell from "@/components/auth/AppShell";
import TimedAlertMessage from "@/components/feedback/TimedAlertMessage";
import { withAuth } from "@/hoc/withAuth";
import { useAuthState } from "@/providers/authProvider";
import { useAdminState, useAdminActions } from "@/providers/adminProvider";
import {
  createTenant,
  updateTenant,
  deleteTenant,
  getTenant,
} from "@/utils/auth/adminService";
import { useStyles } from "@/app/style/style";
import {
  ICreateTenantDto,
  ITenantDto,
  ITenantListItem,
} from "@/interfaces/auth/adminService";
import { PERMISSIONS } from "@/constants/auth/roles";
import { resolveAbpErrorMessage } from "@/utils/abp";
import { canManageTenantsCrud } from "@/utils/auth/roles";

const { Paragraph, Title } = Typography;

const TenantsPageContent = () => {
  const { styles } = useStyles();
  const { permissions, user } = useAuthState();
  const { tenants, isLoadingTenants, errorMessage, actionMessage } =
    useAdminState();
  const { fetchTenants, setActionMessage, clearMessages } = useAdminActions();
  const canManageTenants = canManageTenantsCrud(user?.roles, permissions);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<ITenantListItem | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [processingDeleteId, setProcessingDeleteId] = useState<number | null>(null);
  const [processingEditId, setProcessingEditId] = useState<number | null>(null);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  useEffect(() => {
    void fetchTenants();
  }, [fetchTenants]);

  const handleCreate = async (values: ICreateTenantDto) => {
    if (!canManageTenants) return;
    setIsSubmitting(true);
    try {
      await createTenant({ ...values, connectionString: null });
      setActionMessage({
        type: "success",
        text: "Tenant created successfully.",
      });
      setIsCreateOpen(false);
      createForm.resetFields();
      void fetchTenants();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to create tenant."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: Omit<ITenantDto, "id">) => {
    if (!editingTenant || !canManageTenants) return;
    setIsSubmitting(true);
    try {
      await updateTenant({ ...values, id: editingTenant.id });
      setActionMessage({
        type: "success",
        text: "Tenant updated successfully.",
      });
      setIsEditOpen(false);
      void fetchTenants();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to update tenant."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageTenants) return;
    setProcessingDeleteId(id);
    setIsRefreshingList(true);
    try {
      await deleteTenant(id);
      setActionMessage({ type: "success", text: "Tenant deleted." });
      await fetchTenants();
    } catch (error: unknown) {
      setActionMessage({
        type: "error",
        text: resolveAbpErrorMessage(error, "Failed to delete tenant."),
      });
    } finally {
      setProcessingDeleteId(null);
      setIsRefreshingList(false);
    }
  };

  const openEdit = async (tenant: ITenantListItem) => {
    if (!canManageTenants) return;
    setEditingTenant(tenant);
    setProcessingEditId(tenant.id);
    setIsLoadingEdit(true);
    setIsEditOpen(true);
    try {
      const result = await getTenant(tenant.id);
      editForm.setFieldsValue({
        tenancyName: result.tenancyName,
        name: result.name,
        isActive: result.isActive,
      });
    } catch {
      editForm.setFieldsValue({
        tenancyName: tenant.tenancyName,
        name: tenant.name,
        isActive: tenant.isActive,
      });
    } finally {
      setIsLoadingEdit(false);
      setProcessingEditId(null);
    }
  };

  return (
    <AppShell
      title="Tenants"
      subtitle="Create and manage tenants from the host context. Each tenant operates in full isolation."
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
            Tenant directory
          </Title>
          {canManageTenants ? (
            <Button
              type="primary"
              onClick={() => {
                createForm.resetFields();
                setIsCreateOpen(true);
              }}
            >
              Create tenant
            </Button>
          ) : null}
        </div>
        <Paragraph className={styles.sectionLead}>
          This route is available only when `{PERMISSIONS.tenants}` is granted,
          which typically means host admin access.
        </Paragraph>
        <Table<ITenantListItem>
          rowKey="id"
          loading={isLoadingTenants || isRefreshingList}
          dataSource={tenants}
          className={styles.table}
          columns={[
            {
              title: "Tenant",
              key: "tenant",
              render: (_, record) => (
                <>
                  <strong>{record.name}</strong>
                  <div className={styles.cellHint}>{record.tenancyName}</div>
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
            {
              title: "Actions",
              key: "actions",
              render: (_, record) => (
                canManageTenants ? (
                  <Space size="small" wrap>
                    <Button size="small" onClick={() => void openEdit(record)} loading={processingEditId === record.id && isLoadingEdit}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete tenant"
                      description="This will permanently remove the tenant and all associated data."
                      onConfirm={() => void handleDelete(record.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true, loading: processingDeleteId === record.id }}
                    >
                      <Button size="small" danger>
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
        title="Create tenant"
        open={canManageTenants && isCreateOpen}
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
          <Form.Item
            name="tenancyName"
            label="Tenancy name"
            rules={[
              { required: true },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_-]{1,}$/,
                message:
                  "Must start with a letter and contain only letters, digits, hyphens, or underscores.",
              },
            ]}
          >
            <Input placeholder="e.g. acme-corp" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Display name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. ACME Corporation" />
          </Form.Item>
          <Form.Item
            name="adminEmailAddress"
            label="Admin email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="admin@acme.com" />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit tenant"
        open={canManageTenants && isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => editForm.submit()}
        okText="Save"
        confirmLoading={isSubmitting || isLoadingEdit}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="tenancyName"
            label="Tenancy name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Display name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  );
};

export default withAuth(TenantsPageContent, {
  requiredPermission: PERMISSIONS.tenants,
  requireHostContext: true,
});
