"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import AppShell from "@/components/auth/AppShell";
import TimedAlertMessage from "@/components/feedback/TimedAlertMessage";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";

const InfrastructureWorkspace = ({
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
  const { clearMessages } = useMonitoringInfrastructureActions();
  const { actionMessage, errorMessage, hasTenantContext } =
    useMonitoringInfrastructureState();

  if (!hasTenantContext) {
    return (
      <AppShell title={title} subtitle={subtitle}>
        <Alert
          type="info"
          showIcon
          title="DataSentinel infrastructure is tenant-scoped. Switch into a tenant before managing monitoring references."
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
            <Button icon={<ArrowLeftOutlined />}>
              {backLabel ?? "Back"}
            </Button>
          </Link>
        </div>
      ) : null}
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
          onDismiss={clearMessages}
          className={styles.alert}
        />
      ) : null}
      {children}
    </AppShell>
  );
};

export default InfrastructureWorkspace;
