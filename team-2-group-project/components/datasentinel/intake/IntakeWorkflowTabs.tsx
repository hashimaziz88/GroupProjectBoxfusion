"use client";

import { Card, Tabs, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeFormSharedProps } from "@/interfaces/datasentinel/intakeComponents";
import AbpAuditLogUploadForm from "@/components/datasentinel/intake/AbpAuditLogUploadForm";
import ManualActivityBatchForm from "@/components/datasentinel/intake/ManualActivityBatchForm";
import SeedSimulatedLogsForm from "@/components/datasentinel/intake/SeedSimulatedLogsForm";

const { Paragraph, Title } = Typography;

const IntakeWorkflowTabs = (props: IIntakeFormSharedProps) => {
  const { styles } = useStyles();

  return (
    <Card className={styles.pageCard}>
      <Title level={4} className={styles.sectionTitle}>
        Intake workflows
      </Title>
      <Paragraph className={styles.sectionLead}>
        Use the same backend contracts the simulation pipeline already exposes. Manual activity accepts normalized event DTOs, while ABP upload and seeded simulation both work with the audit-log shape.
      </Paragraph>

      <Tabs
        items={[
          {
            key: "manual",
            label: "Manual activity batch",
            children: <ManualActivityBatchForm {...props} />,
          },
          {
            key: "abp",
            label: "ABP audit log upload",
            children: <AbpAuditLogUploadForm {...props} />,
          },
          {
            key: "seed",
            label: "Seed simulated ABP logs",
            children: <SeedSimulatedLogsForm {...props} />,
          },
        ]}
      />
    </Card>
  );
};

export default IntakeWorkflowTabs;
