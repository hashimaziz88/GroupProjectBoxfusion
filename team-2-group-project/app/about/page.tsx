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
      title="About"
      subtitle="DataSentinel — real-time database activity monitoring and security intelligence platform."
    >
      <Card className={styles.pageCard}>
        <Title level={4} className={styles.sectionTitle}>
          Current session
        </Title>
        <Paragraph className={styles.sectionLead}>
          Your active session details. Tenant context is resolved at startup and permissions are loaded after sign-in.
        </Paragraph>
        <div className={styles.tagRow}>
          <Tag className={styles.infoTag}>
            User: {user?.userName ?? "Anonymous"}
          </Tag>
          <Tag className={styles.infoTag}>
            Tenant: {currentTenant?.tenancyName ?? "Host"}
          </Tag>
          <Tag className={styles.infoTag}>
            Email: {user?.emailAddress ?? "Not available"}
          </Tag>
        </div>
      </Card>
    </AppShell>
  );
};

export default withAuth(AboutPageContent);
