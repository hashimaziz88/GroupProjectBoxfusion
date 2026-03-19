"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import AppShell from "@/components/auth/AppShell";
import { useStyles } from "@/components/datasentinel/alerts/style/style";
import {
  useSecurityAlertsActions,
  useSecurityAlertsState,
} from "@/providers/securityAlertsProvider";

const SecurityAlertsWorkspace = ({
  title,
  subtitle,
  children,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) => {
  const { styles } = useStyles();
  const { clearMessages } = useSecurityAlertsActions();
  const { actionMessage, errorMessage, hasTenantContext } = useSecurityAlertsState();

  if (!hasTenantContext) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel security alerts are tenant-scoped. Switch into a tenant before opening this page."
          className={styles.alert}
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={title} subtitle={subtitle}>
      {backHref ? (
        <div className={styles.backRow}>
          <Link href={backHref}>
            <Button icon={<ArrowLeftOutlined />}>{backLabel ?? "Back"}</Button>
          </Link>
        </div>
      ) : null}
      {errorMessage ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage}
          closable
          onClose={clearMessages}
          className={styles.alert}
        />
      ) : null}
      {actionMessage ? (
        <Alert
          type={actionMessage.type}
          showIcon
          title={actionMessage.text}
          closable
          onClose={clearMessages}
          className={styles.alert}
        />
      ) : null}
      {children}
    </AppShell>
  );
};

export default SecurityAlertsWorkspace;
