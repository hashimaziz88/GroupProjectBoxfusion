"use client";

import { Button, Card, Select, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import {
  useReportExportActions,
  useReportExportState,
} from "@/providers/reportExportProvider";
import { useStyles } from "./style/style";

const ReportExportControls = () => {
  const { styles } = useStyles();
  const { isRefreshing, windowDays } = useReportExportState();
  const { refresh, setWindowDays } = useReportExportActions();

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Report Scope
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Choose the export window for the alert and activity registers used by
        this reporting workspace.
      </Typography.Paragraph>

      <div className={styles.controlRow}>
        <div className={styles.controlField}>
          <span>Window</span>
          <Select
            value={windowDays}
            options={[
              { value: 7, label: "Last 7 days" },
              { value: 14, label: "Last 14 days" },
              { value: 30, label: "Last 30 days" },
              { value: 90, label: "Last 90 days" },
            ]}
            onChange={setWindowDays}
          />
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={isRefreshing}
          onClick={() => void refresh()}
        >
          Refresh source data
        </Button>
      </div>
    </Card>
  );
};

export default ReportExportControls;
