"use client";

import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import { useMonitoringInfrastructureState } from "@/providers/monitoringInfrastructureProvider";

const InfrastructureSummaryCards = () => {
  const { styles } = useStyles();
  const { allDatabases, allTables, servers } = useMonitoringInfrastructureState();

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Monitored servers</span>
        <span className={styles.statValue}>{servers.length}</span>
        <span className={styles.statHint}>
          Tenant infrastructure entry points currently available to DataSentinel.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Databases</span>
        <span className={styles.statValue}>{allDatabases.length}</span>
        <span className={styles.statHint}>
          Database references available for activity mapping and validation.
        </span>
      </div>

      <div className={styles.statCard}>
        <span className={styles.statLabel}>Tables</span>
        <span className={styles.statValue}>{allTables.length}</span>
        <span className={styles.statHint}>
          Optional object-level references already modeled in the backend.
        </span>
      </div>
    </div>
  );
};

export default InfrastructureSummaryCards;
