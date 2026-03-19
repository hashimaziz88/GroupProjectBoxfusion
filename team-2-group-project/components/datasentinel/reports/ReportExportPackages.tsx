"use client";

import { Button, Card, Typography } from "antd";
import { DownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import {
  useReportExportActions,
  useReportExportState,
} from "@/providers/reportExportProvider";
import { useStyles } from "./style/style";

const ReportExportPackages = () => {
  const { styles } = useStyles();
  const { alerts, activityEvents, exportingKey } = useReportExportState();
  const {
    exportActivityCsv,
    exportAlertsCsv,
    exportBundlePdf,
    exportIncidentPdf,
  } = useReportExportActions();

  const packages = [
    {
      key: "snapshot",
      title: "Tenant report bundle",
      meta: `PDF bundle with ${alerts.length} alert row(s) and ${activityEvents.length} activity row(s).`,
      icon: <DownloadOutlined />,
      action: exportBundlePdf,
      label: "Export PDF bundle",
    },
    {
      key: "alerts",
      title: "Alert register",
      meta: "CSV export of the current alert review register for offline analysis or handoff.",
      icon: <DownloadOutlined />,
      action: exportAlertsCsv,
      label: "Export alerts CSV",
    },
    {
      key: "activity",
      title: "Activity register",
      meta: "CSV export of the activity evidence set that supports the current report window.",
      icon: <DownloadOutlined />,
      action: exportActivityCsv,
      label: "Export activity CSV",
    },
    {
      key: "incident",
      title: "Incident PDF",
      meta: "Generate a single incident report PDF for the selected alert below.",
      icon: <FilePdfOutlined />,
      action: exportIncidentPdf,
      label: "Export incident PDF",
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Typography.Title level={4} className={styles.sectionTitle}>
        Export Packages
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionLead}>
        Generate shareable outputs without duplicating dashboard insight.
      </Typography.Paragraph>

      <div className={styles.packageList}>
        {packages.map((item) => (
          <div key={item.key} className={styles.packageCard}>
            <div>
              <Typography.Text strong>{item.title}</Typography.Text>
              <div className={styles.packageMeta}>{item.meta}</div>
            </div>
            <Button
              type="primary"
              icon={item.icon}
              loading={exportingKey === item.key}
              onClick={() => void item.action()}
            >
              {item.label}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportExportPackages;
