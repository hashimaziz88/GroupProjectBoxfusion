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
    return "Host administrators have full access to tenant management and platform-wide administration.";
  }

  if (isTenantAdmin(roles)) {
    return "Tenant administrators can manage users and roles within the active tenant.";
  }

  return "You have access to the features and routes granted to your account by your administrator.";
};

const HomePageContent = () => {
  const { styles } = useStyles();
  const { currentTenant, permissions, user } = useAuthState();

  return (
    <AppShell
      title="Home"
      subtitle="Welcome to DataSentinel. Use the navigation to access monitoring, infrastructure, and administration features."
    >
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Tenant context</span>
          <span className={styles.statValue}>
            {currentTenant?.tenancyName ?? "Host"}
          </span>
          <span className={styles.statHint}>
            Your active workspace context.
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Signed in as</span>
          <span className={styles.statValue}>{user?.userName ?? "Unknown"}</span>
          <span className={styles.statHint}>
            {user?.name} {user?.surname}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Permissions</span>
          <span className={styles.statValue}>{permissions?.length ?? 0}</span>
          <span className={styles.statHint}>
            Effective permissions granted to your account.
          </span>
        </div>
      </div>

      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Access profile
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
