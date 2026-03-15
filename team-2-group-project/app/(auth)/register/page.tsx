"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Form, Input, Typography } from "antd";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLayout from "@/components/auth/AuthLayout";
import AppSpinner from "@/components/spinner/AppSpinner";
import { useAuthActions, useAuthState } from "@/providers/authProvider";
import { selectBestAuthenticatedRoute } from "@/utils/roles";
import { useStyles } from "@/app/(auth)/style/style";

const { Paragraph, Title } = Typography;

interface IRegisterFormValues {
  name: string;
  surname: string;
  emailAddress: string;
  userName: string;
  password: string;
}

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
      asideTitle="Create a tenant user the same way the Angular client does."
      asideText="Self-registration is enabled only inside a selected tenant. Successful registration will sign the user in automatically when the backend allows it."
    >
      <AuthHeader
        title="Register"
        subtitle="Create a user inside the active tenant context using the ABP account registration endpoint."
        tenantLabel={
          currentTenant?.tenancyName
            ? `Tenant: ${currentTenant.tenancyName}`
            : "Registration unavailable in host context"
        }
      />

      {!currentTenant?.tenantId ? (
        <>
          <section className={styles.sectionCard}>
            <Title level={5} className={styles.tenantName}>
              No tenant selected
            </Title>
            <Paragraph className={styles.tenantHint}>
              Angular only exposes self-registration in tenant context. Select a tenant on the login page first.
            </Paragraph>
          </section>
          <AuthFooterLink
            question="Need to choose a tenant first?"
            label="Back to login"
            href="/login"
          />
        </>
      ) : (
        <>
          {isError && errorMessage ? (
            <Alert
              type="error"
              showIcon
              message={errorMessage}
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
                  Register
                </Button>
              </div>
            </div>
          </Form>

          <AuthFooterLink
            question="Already have an account?"
            label="Back to login"
            href="/login"
          />
        </>
      )}
    </AuthLayout>
  );
}
