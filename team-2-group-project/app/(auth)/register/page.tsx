"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input, Typography } from "antd";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/auth/roles";
import { useStyles } from "@/app/(auth)/style/style";
import { IRegisterFormValues } from "@/interfaces/auth/authProps";

const { Paragraph, Title } = Typography;



export default function RegisterPage() {
  const router = useRouter();
  const { styles } = useStyles();
  const { register } = useAuthActions();
  const {
    currentTenant,
    errorMessage,
    isAuthenticated,
    isPending,
    isReady,
    isError,
    user,
  } = useAuthState();

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    router.replace(selectBestAuthenticatedRoute(user));
  }, [isAuthenticated, isReady, router, user]);

  const handleSubmit = async (values: IRegisterFormValues) => {
    await register(values);
  };

  if (!isReady && !isAuthenticated) {
    return <AppSpinner label="Loading registration..." />;
  }

  return (
    <AuthLayout
      asideTitle="Create a secure monitoring account."
      asideText="Self-registration is available only inside a selected tenant environment. When enabled by the backend, new users can join the DataSentinel workspace immediately after registration."
    >
      <AuthHeader
        title="Create account"
        subtitle="Register a user for the active monitoring environment."
        tenantLabel={
          currentTenant?.tenancyName
            ? `Environment: ${currentTenant.tenancyName}`
            : "Registration unavailable in host workspace"
        }
      />

      {!currentTenant?.tenantId ? (
        <>
          <section className={styles.sectionCard}>
            <Title level={5} className={styles.tenantName}>
              No environment selected
            </Title>
            <Paragraph className={styles.tenantHint}>
              Self-registration is only available in a tenant environment. Choose the correct environment on the sign-in page first.
            </Paragraph>
          </section>
          <AuthFooterLink
            question="Need to choose an environment first?"
            label="Back to sign in"
            href="/login"
          />
        </>
      ) : (
        <>
          {isError && errorMessage ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage}
              className={styles.alert}
            />
          ) : null}

          <Form<IRegisterFormValues>
            layout="vertical"
            onFinish={(values) => void handleSubmit(values)}
          >
            <div className={styles.fieldStack}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required." }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Surname"
                name="surname"
                rules={[{ required: true, message: "Surname is required." }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Email address"
                name="emailAddress"
                rules={[
                  { required: true, message: "Email address is required." },
                  { type: "email", message: "Enter a valid email address." },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Username"
                name="userName"
                rules={[{ required: true, message: "Username is required." }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required." },
                  { min: 8, message: "Password must be at least 8 characters." },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <div className={styles.formActions}>
                <Button
                  htmlType="submit"
                  loading={isPending}
                  className={styles.primaryButton}
                >
                  Create account
                </Button>
              </div>
            </div>
          </Form>

          <AuthFooterLink
            question="Already have access?"
            label="Back to sign in"
            href="/login"
          />
        </>
      )}
    </AuthLayout>
  );
}
