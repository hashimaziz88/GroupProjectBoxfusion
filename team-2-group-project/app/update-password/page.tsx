"use client";

import { useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import TimedAlertMessage from "@/components/feedback/TimedAlertMessage";
import { withAuth } from "@/hoc/withAuth";
import { resolveAbpErrorMessage } from "@/utils/abp";
import { changePassword } from "@/utils/auth/adminService";
import { useStyles } from "@/app/style/style";

const { Paragraph, Title } = Typography;

interface IUpdatePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const passwordPattern =
  /^(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z!@#$%^&*()]*$/;

const UpdatePasswordPageContent = () => {
  const { styles } = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: IUpdatePasswordForm) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
      .then((result) => {
        if (result) {
          setSuccessMessage("Password changed successfully.");
          return;
        }

        setErrorMessage("The password update was not accepted by the server.");
      })
      .catch((error: unknown) => {
        setErrorMessage(resolveAbpErrorMessage(error, "Failed to update the password."));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <AppShell
      title="Update Password"
      subtitle="Update your account password. You will need your current password to set a new one."
    >
      {/* User feedback: success state */}
      {successMessage ? (
        <TimedAlertMessage
          type="success"
          title={successMessage}
          onDismiss={() => setSuccessMessage(null)}
          className={styles.alert}
        />
      ) : null}

      {/* User feedback: error state */}
      {errorMessage ? (
        <TimedAlertMessage
          type="error"
          title={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          className={styles.alert}
        />
      ) : null}

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Change your password
        </Title>
        <Paragraph className={styles.sectionLead}>
          The new password must be at least 8 characters and include uppercase, lowercase, and numeric characters.
        </Paragraph>

        <Form<IUpdatePasswordForm>
          layout="vertical"
          onFinish={(values) => void handleSubmit(values)}
          className={styles.formStack}
        >
          <Form.Item
            label="Current password"
            name="currentPassword"
            rules={[{ required: true, message: "Current password is required." }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="New password"
            name="newPassword"
            rules={[
              { required: true, message: "New password is required." },
              {
                pattern: passwordPattern,
                message:
                  "Passwords must be at least 8 characters and contain uppercase, lowercase, and numeric characters.",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm new password"
            name="confirmNewPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm the new password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("The confirmation password must match."),
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <div className={styles.formActions}>
            <Button
              htmlType="submit"
              loading={isSubmitting}
              className={styles.primaryButton}
            >
              Save
            </Button>
          </div>
        </Form>
      </Card>
    </AppShell>
  );
};

export default withAuth(UpdatePasswordPageContent);
