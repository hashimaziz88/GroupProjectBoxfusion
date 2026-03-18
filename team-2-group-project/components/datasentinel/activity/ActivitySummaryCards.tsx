"use client";

import { useStyles } from "@/components/datasentinel/activity/style/style";
import { useActivityMonitoringState } from "@/providers/activityMonitoringProvider";

const ActivitySummaryCards = () => {
  const { styles } = useStyles();
  const { isSummaryLoading, summary } = useActivityMonitoringState();

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Total events</span>
        <span className={styles.statValue}>
          {isSummaryLoading ? "..." : summary.totalEvents}
        </span>
        <span className={styles.statHint}>
          Total tenant-scoped activity events available to monitor.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Suspicious activity</span>
        <span className={styles.statValue}>
          {isSummaryLoading ? "..." : summary.suspiciousActivityCount}
        </span>
        <span className={styles.statHint}>
          Events at medium severity or above.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Failed events</span>
        <span className={styles.statValue}>
          {isSummaryLoading ? "..." : summary.failedEventsCount}
        </span>
        <span className={styles.statHint}>
          Failed activity attempts captured by the backend.
        </span>
      </div>
    </div>
  );
};

export default ActivitySummaryCards;
