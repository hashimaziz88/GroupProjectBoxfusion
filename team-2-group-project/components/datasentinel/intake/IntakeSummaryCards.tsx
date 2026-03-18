"use client";

import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeSummaryCardsProps } from "@/interfaces/datasentinel/intakeComponents";

const IntakeSummaryCards = ({
  monitoredServersCount,
  databasesCount,
  lastAcceptedCount,
}: IIntakeSummaryCardsProps) => {
  const { styles } = useStyles();

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Monitored servers</span>
        <span className={styles.statValue}>{monitoredServersCount}</span>
        <span className={styles.statHint}>
          Reference targets available for current-tenant event validation.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Monitored databases</span>
        <span className={styles.statValue}>{databasesCount}</span>
        <span className={styles.statHint}>
          Useful when attaching imported audit logs to a specific monitored workload.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Last accepted</span>
        <span className={styles.statValue}>{lastAcceptedCount}</span>
        <span className={styles.statHint}>
          The latest intake result returned by the backend in this session.
        </span>
      </div>
    </div>
  );
};

export default IntakeSummaryCards;
