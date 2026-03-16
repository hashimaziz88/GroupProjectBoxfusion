"use client";

import { Card, Tag, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { useAuthState } from "@/providers/authProvider";
import { useStyles } from "@/app/style/style";

const { Paragraph, Title } = Typography;

const AboutPageContent = () => {
  const { styles } = useStyles();
  const { currentTenant, user } = useAuthState();

  return (
    <AppShell
      title="Platform Overview"
      subtitle="Review the current monitoring session, active environment context, and account identity behind this DataSentinel workspace."
    >
      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Current monitoring session
        </Title>
        <Paragraph className={styles.sectionLead}>
          DataSentinel resolves tenant context before authentication, then loads the signed-in operator profile and effective permissions required for anomaly monitoring and incident investigation.
        </Paragraph>
        <div className={styles.tagRow}>
          <Tag className={styles.infoTag}>
            Operator: {user?.userName ?? "Anonymous"}
          </Tag>
          <Tag className={styles.infoTag}>
            Environment: {currentTenant?.tenancyName ?? "Host"}
          </Tag>
          <Tag className={styles.infoTag}>
            Contact: {user?.emailAddress ?? "Not available"}
          </Tag>
        </div>
      </Card>
    </AppShell>
  );
};

export default withAuth(AboutPageContent);
