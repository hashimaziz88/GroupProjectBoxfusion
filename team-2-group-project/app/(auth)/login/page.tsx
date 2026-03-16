"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Checkbox, Form, Input, Typography } from "antd";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";
import { useStyles } from "@/app/(auth)/style/style";
import { ILoginFormValues } from "@/interfaces/auth/authProps";

const { Paragraph, Text, Title } = Typography;



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
        ? `Environment: ${currentTenant.tenancyName}`
        : "Host workspace",
    [currentTenant?.tenancyName],
  );

  const registrationEnabled = Boolean(currentTenant?.tenantId);
  const showRegisteredMessage = searchParams.get("registered") === "1";

  const handleTenantChange = async () => {
    const result = await changeTenant(tenantName.trim() || null);

    if (result.state === "available") {
      setTenantFeedback({
        type: "success",
        message: `Environment switched to ${result.tenancyName}.`,
      });
      return;
    }

    if (result.state === "host") {
      setTenantFeedback({
        type: "success",
        message: "Tenant context cleared. You are now operating in the host workspace.",
      });
      return;
    }

    if (result.state === "inactive") {
      setTenantFeedback({
        type: "warning",
        message: `Environment ${result.tenancyName} is inactive.`,
      });
      return;
    }

    setTenantFeedback({
      type: "warning",
      message: `No tenant environment was found with the name ${result.tenancyName}.`,
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
      asideTitle="Secure access for SQL anomaly monitoring."
      asideText="Sign in to DataSentinel to investigate suspicious database activity, review anomaly alerts, and work inside the correct tenant environment."
    >
      <AuthHeader
        title="Sign in"
        subtitle="Use your username or email address and password to enter the monitoring workspace for the selected tenant or host context."
        tenantLabel={tenantLabel}
      />

      {showRegisteredMessage ? (
        <Alert
          type="success"
          showIcon
          title="Registration completed. You can sign in to DataSentinel now."
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
              {currentTenant?.tenancyName ?? "No environment selected"}
            </Title>
            <Paragraph className={styles.tenantHint}>
              Choose the tenant environment you want to monitor, or leave the field empty to return to the host workspace.
            </Paragraph>
          </div>

          <div className={styles.fieldStack}>
            <div>
              <Text className={styles.fieldLabel}>Tenant environment</Text>
              <Input
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                placeholder="Enter a tenant name"
              />
            </div>

            <div className={styles.formActions}>
              <Button
                onClick={() => void handleTenantChange()}
                className={styles.secondaryButton}
              >
                Switch environment
              </Button>

              <Button
                onClick={() => {
                  setTenantName("");
                  void changeTenant(null).then(() => {
                    setTenantFeedback({
                      type: "success",
                      message: "Tenant context cleared. You are now operating in the host workspace.",
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
          question="Need a monitored-environment account?"
          label="Create account"
          href="/register"
        />
      ) : (
        <div className={styles.footerLinkRow}>
          <Text className={styles.footerText}>
            Self-service registration is available only when a tenant environment is selected.
          </Text>
        </div>
      )}
    </AuthLayout>
  );
}
