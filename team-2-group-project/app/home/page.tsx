"use client";

import { Card, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { useAuthState } from "@/providers/authProvider";
import { useStyles } from "@/app/style/style";
import { isHostAdmin, isTenantAdmin } from "@/utils/auth/roles";

const { Paragraph, Title } = Typography;

const resolveAccessSummary = (roles?: string[] | null) => {
  if (isHostAdmin(roles)) {
    return "Platform administrators can review cross-environment monitoring scope, host-level configuration, and tenant-wide security operations.";
  }

  if (isTenantAdmin(roles)) {
    return "Environment administrators can manage identities, review access-sensitive activity, and coordinate investigations inside the active tenant workspace.";
  }

  return "Security analysts land here to review the monitoring workspace and only see routes granted by the current permission set.";
};

const HomePageContent = () => {
  const { styles } = useStyles();
  const { currentTenant, permissions, user } = useAuthState();

  return (
    <AppShell
      title="Monitoring Overview"
      subtitle="A quick view of the current DataSentinel workspace, including monitoring scope, signed-in operator context, and loaded controls."
    >
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Monitoring scope</span>
          <span className={styles.statValue}>
            {currentTenant?.tenancyName ?? "Host"}
          </span>
          <span className={styles.statHint}>
            This is the active environment used for alert review, anomaly triage, and permission-aware monitoring.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active operator</span>
          <span className={styles.statValue}>{user?.userName ?? "Unknown"}</span>
          <span className={styles.statHint}>
            {user?.name} {user?.surname}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Granted controls</span>
          <span className={styles.statValue}>{permissions?.length ?? 0}</span>
          <span className={styles.statHint}>
            Effective permissions currently loaded for investigation and administration workflows.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Operational access profile
        </Title>
        <Paragraph className={styles.sectionLead}>
          {resolveAccessSummary(user?.roles)}
        </Paragraph>
        <div className={styles.tagRow}>
          {(user?.roles ?? []).map((role) => (
            <Tag key={role} className={styles.infoTag}>
              {role}
            </Tag>
          ))}
          {(permissions ?? []).slice(0, 8).map((permission) => (
            <Tag key={permission} className={styles.infoTag}>
              {permission}
            </Tag>
          ))}
        </div>
      </Card>
    </AppShell>
  );
};

export default withAuth(HomePageContent);
