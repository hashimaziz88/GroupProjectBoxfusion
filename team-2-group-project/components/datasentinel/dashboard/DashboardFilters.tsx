"use client";

import { Button, Card, Select, Typography } from "antd";
import { useDashboardActions, useDashboardState } from "@/providers/dashboardProvider";
import { useStyles } from "./style/style";

const WINDOW_OPTIONS = [
  { label: "24 hours", value: 1 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

const BUCKET_OPTIONS = [
  { label: "1 hour", value: 1 },
  { label: "6 hours", value: 6 },
  { label: "12 hours", value: 12 },
  { label: "24 hours", value: 24 },
];

const COUNT_OPTIONS = [
  { label: "Top 3", value: 3 },
  { label: "Top 5", value: 5 },
  { label: "Top 10", value: 10 },
];

const DashboardFilters = () => {
  const { styles } = useStyles();
  const { filters, isRefreshing } = useDashboardState();
  const { applyFilters, refresh, resetFilters, setFilterValue } =
    useDashboardActions();

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={5} className={styles.sectionTitle}>
        Dashboard Controls
      </Typography.Title>

      <div className={styles.filterGrid}>
        <div className={styles.filterField}>
          <Typography.Text strong>Window</Typography.Text>
          <Select
            options={WINDOW_OPTIONS}
            value={filters.windowDays}
            onChange={(value) => setFilterValue("windowDays", value)}
          />
        </div>

        {/* Search removed — dashboard uses existing filter options only */}

        <div className={styles.filterField}>
          <Typography.Text strong>Trend bucket</Typography.Text>
          <Select
            options={BUCKET_OPTIONS}
            value={filters.bucketHours}
            onChange={(value) => setFilterValue("bucketHours", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Typography.Text strong>Top users</Typography.Text>
          <Select
            options={COUNT_OPTIONS}
            value={filters.maxUsers}
            onChange={(value) => setFilterValue("maxUsers", value)}
          />
        </div>

        <div className={styles.filterField}>
          <Typography.Text strong>Top entities</Typography.Text>
          <Select
            options={COUNT_OPTIONS}
            value={filters.maxEntities}
            onChange={(value) => setFilterValue("maxEntities", value)}
          />
        </div>
      </div>

      <div className={styles.filterActionsRow}>
        <Button type="primary" onClick={() => void applyFilters()}>
          Apply filters
        </Button>
        <Button onClick={() => void resetFilters()}>Reset</Button>
        <Button loading={isRefreshing} onClick={() => void refresh()}>
          Refresh
        </Button>
      </div>
    </Card>
  );
};

export default DashboardFilters;
