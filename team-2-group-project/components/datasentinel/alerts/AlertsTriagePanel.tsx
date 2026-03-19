"use client";

import { Button, Skeleton, Typography } from "antd";
import {
  useSecurityAlertsActions,
  useSecurityAlertsState,
} from "@/providers/securityAlertsProvider";
import { useStyles } from "@/components/datasentinel/alerts/style/style";

const { Text } = Typography;

const ROBOT_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <line x1="12" y1="7" x2="12" y2="11" />
    <line x1="8" y1="15" x2="8" y2="17" />
    <line x1="16" y1="15" x2="16" y2="17" />
  </svg>
);

export default function AlertsTriagePanel() {
  const { styles } = useStyles();
  const { triageAnalysis, isTriageLoading, triageError } = useSecurityAlertsState();
  const { retryTriageAnalysis } = useSecurityAlertsActions();

  if (isTriageLoading) {
    return (
      <div className={styles.aiPanel}>
        <div className={styles.aiPanelHeader}>
          {ROBOT_ICON}
          <Text strong className={styles.aiPanelTitle}>AI Triage Guidance</Text>
        </div>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </div>
    );
  }

  if (triageError) {
    return (
      <div className={styles.aiPanel}>
        <div className={styles.aiPanelHeader}>
          {ROBOT_ICON}
          <Text strong className={styles.aiPanelTitle}>AI Triage Guidance</Text>
        </div>
        <div className={styles.aiErrorBlock}>
          <Text type="secondary">{triageError}</Text>
          <Button size="small" onClick={retryTriageAnalysis}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!triageAnalysis) {
    return null;
  }

  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiPanelHeader}>
        {ROBOT_ICON}
        <Text strong className={styles.aiPanelTitle}>AI Triage Guidance</Text>
      </div>
      <div className={styles.aiSection}>
        <div className={styles.aiNextStepBlock}>
          <span className={styles.aiSectionLabel}>Where to Start</span>
          <Text>{triageAnalysis.triageGuidance}</Text>
        </div>
      </div>
    </div>
  );
}
