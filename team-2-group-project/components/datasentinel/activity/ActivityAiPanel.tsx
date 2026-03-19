"use client";

import { Button, Skeleton, Typography } from "antd";
import {
  useActivityMonitoringActions,
  useActivityMonitoringState,
} from "@/providers/activityMonitoringProvider";
import { useStyles } from "@/components/datasentinel/activity/style/style";

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

export default function ActivityAiPanel() {
  const { styles } = useStyles();
  const { aiAnalysis, isAiLoading, aiError } = useActivityMonitoringState();
  const { retryAiAnalysis } = useActivityMonitoringActions();

  if (isAiLoading) {
    return (
      <div className={styles.aiPanel}>
        <div className={styles.aiPanelHeader}>
          {ROBOT_ICON}
          <Text strong className={styles.aiPanelTitle}>AI Pattern Analysis</Text>
        </div>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </div>
    );
  }

  if (aiError) {
    return (
      <div className={styles.aiPanel}>
        <div className={styles.aiPanelHeader}>
          {ROBOT_ICON}
          <Text strong className={styles.aiPanelTitle}>AI Pattern Analysis</Text>
        </div>
        <div className={styles.aiErrorBlock}>
          <Text type="secondary">{aiError}</Text>
          <Button size="small" onClick={retryAiAnalysis}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!aiAnalysis) {
    return null;
  }

  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiPanelHeader}>
        {ROBOT_ICON}
        <Text strong className={styles.aiPanelTitle}>AI Pattern Analysis</Text>
      </div>
      <div className={styles.aiSection}>
        <span className={styles.aiSectionLabel}>Suspicious Patterns</span>
        <Text>{aiAnalysis.patternSummary}</Text>
      </div>
    </div>
  );
}
