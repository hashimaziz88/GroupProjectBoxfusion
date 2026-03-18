"use client";

import { Card, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/activity/style/style";
import { useActivityMonitoringState } from "@/providers/activityMonitoringProvider";

const { Paragraph, Title } = Typography;

const ActivityOverviewCard = () => {
  const { styles } = useStyles();
  const { summary } = useActivityMonitoringState();

  return (
    <Card className={styles.pageCard}>
      <div className={styles.cardToolbar}>
        <div>
          <Title level={4} className={styles.sectionTitle}>
            Overview
          </Title>
          <Paragraph className={styles.sectionLead}>
            The backend now exposes summary metrics and activity-specific filter options, so this page is fully wired to the current query surface.
          </Paragraph>
        </div>
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Read ops</span>
          <span className={styles.statValue}>{summary.readOps}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Write ops</span>
          <span className={styles.statValue}>{summary.writeOps}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Auth events</span>
          <span className={styles.statValue}>{summary.authEvents}</span>
        </div>
      </div>
    </Card>
  );
};

export default ActivityOverviewCard;
