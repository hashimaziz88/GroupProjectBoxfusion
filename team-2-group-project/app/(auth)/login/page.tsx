"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Checkbox, Form, Input, Typography } from "antd";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/roles";
import { useStyles } from "@/app/(auth)/style/style";

const { Paragraph, Text, Title } = Typography;

interface ILoginFormValues {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient: boolean;
}

type TenantFeedbackState =
  | { type: "success"; message: string }
  | { type: "warning"; message: string }
  | null;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { styles } = useStyles();
  const { changeTenant, login } = useAuthActions();
  const {
    currentTenant,
    errorMessage,
    isAuthenticated,
    isPending,
    isReady,
    isError,
    multiTenancyEnabled,
    user,
  } = useAuthState();

  const [tenantName, setTenantName] = useState(currentTenant?.tenancyName ?? "");
  const [tenantFeedback, setTenantFeedback] = useState<TenantFeedbackState>(null);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    router.replace(selectBestAuthenticatedRoute(user));
  }, [isAuthenticated, isReady, router, user]);

  const tenantLabel = useMemo(
    () =>
      currentTenant?.tenancyName
        ? `Tenant: ${currentTenant.tenancyName}`
        : "Host session",
    [currentTenant?.tenancyName],
  );

  const registrationEnabled = Boolean(currentTenant?.tenantId);
  const showRegisteredMessage = searchParams.get("registered") === "1";

  const handleTenantChange = async () => {
    const result = await changeTenant(tenantName.trim() || null);

    if (result.state === "available") {
      setTenantFeedback({
        type: "success",
        message: `Tenant changed to ${result.tenancyName}.`,
      });
      return;
    }

    if (result.state === "host") {
      setTenantFeedback({
        type: "success",
        message: "Tenant context cleared. You are now in the host context.",
      });
      return;
    }

    if (result.state === "inactive") {
      setTenantFeedback({
        type: "warning",
        message: `Tenant ${result.tenancyName} is not active.`,
      });
      return;
    }

    setTenantFeedback({
      type: "warning",
      message: `There is no tenant defined with the name ${result.tenancyName}.`,
    });
  };

  const handleSubmit = async (values: ILoginFormValues) => {
    await login(values);
  };

  if (!isReady && !isAuthenticated) {
    return <AppSpinner label="Loading login..." />;
  }

  return (
    <AuthLayout
      asideTitle="Sign in with tenant-aware ABP authentication."
      asideText="The login flow resolves tenant context first, then authenticates against the same backend endpoints used by the Angular client."
    >
      <AuthHeader
        title="Log in"
        subtitle="Use your username or email address and password to enter the tenant or host workspace."
        tenantLabel={tenantLabel}
      />

      {showRegisteredMessage ? (
        <Alert
          type="success"
          showIcon
          title="Registration completed. You can sign in now."
          className={styles.alert}
        />
      ) : null}

      {tenantFeedback ? (
        <Alert
          type={tenantFeedback.type}
          showIcon
          title={tenantFeedback.message}
          className={styles.alert}
        />
      ) : null}

      {isError && errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          className={styles.alert}
        />
      ) : null}

      {multiTenancyEnabled ? (
        <section className={styles.sectionCard}>
          <div className={styles.tenantSummary}>
            <Title level={5} className={styles.tenantName}>
              {currentTenant?.tenancyName ?? "No tenant selected"}
            </Title>
            <Paragraph className={styles.tenantHint}>
              Leave the field empty to return to the host context.
            </Paragraph>
          </div>

          <div className={styles.fieldStack}>
            <div>
              <Text className={styles.fieldLabel}>Tenant name</Text>
              <Input
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                placeholder="Enter a tenancy name"
              />
            </div>

            <div className={styles.formActions}>
              <Button
                onClick={() => void handleTenantChange()}
                className={styles.secondaryButton}
              >
                Change tenant
              </Button>

              <Button
                onClick={() => {
                  setTenantName("");
                  void changeTenant(null).then(() => {
                    setTenantFeedback({
                      type: "success",
                      message: "Tenant context cleared. You are now in the host context.",
                    });
                  });
                }}
                className={styles.secondaryButton}
              >
                Continue as host
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <Form<ILoginFormValues>
        layout="vertical"
        initialValues={{ rememberClient: true }}
        onFinish={(values) => void handleSubmit(values)}
      >
        <div className={styles.fieldStack}>
          <Form.Item
            label="Username or email"
            name="userNameOrEmailAddress"
            rules={[
              {
                required: true,
                message: "Username or email is required.",
              },
            ]}
          >
            <Input placeholder="name@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required." }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item name="rememberClient" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <div className={styles.formActions}>
            <Button
              htmlType="submit"
              loading={isPending}
              className={styles.primaryButton}
            >
              Log in
            </Button>
          </div>
        </div>
      </Form>

      {registrationEnabled ? (
        <AuthFooterLink
          question="Need a tenant account?"
          label="Register"
          href="/register"
        />
      ) : (
        <div className={styles.footerLinkRow}>
          <Text className={styles.footerText}>
            Registration is available only when a tenant is selected.
          </Text>
        </div>
      )}
    </AuthLayout>
  );
}
