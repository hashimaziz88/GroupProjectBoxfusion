"use client";

import { Card, Table, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/intake/style/style";
import { IIntakeResultPanelProps } from "@/interfaces/datasentinel/intakeComponents";
import { toArray } from "@/utils/helpers";

const { Paragraph, Text, Title } = Typography;

const IntakeResultPanel = ({ lastResult }: IIntakeResultPanelProps) => {
  const { styles } = useStyles();

  const errorColumns = [
    {
      title: "Item index",
      dataIndex: "itemIndex",
      key: "itemIndex",
      width: 110,
    },
    {
      title: "Validation errors",
      key: "errors",
      render: (_: unknown, record: { errors?: string[] | null }) => (
        <div className={styles.tagRow}>
          {toArray(record.errors).map((error) => (
            <Tag key={error} color="red">
              {error}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card className={styles.pageCard}>
      <Title level={4} className={styles.sectionTitle}>
        Latest result
      </Title>
      {lastResult ? (
        <div className={styles.stackedCards}>
          <Paragraph className={styles.sectionLead}>
            <Text strong>{lastResult.label}</Text> returned the following backend response.
          </Paragraph>

          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Received</span>
              <span className={styles.statValue}>{lastResult.result.receivedCount}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Accepted</span>
              <span className={styles.statValue}>{lastResult.result.acceptedCount}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Rejected</span>
              <span className={styles.statValue}>{lastResult.result.rejectedCount}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Alerts created</span>
              <span className={styles.statValue}>
                {lastResult.result.detectionSummary?.createdAlertCount ?? 0}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Duplicate alerts skipped</span>
              <span className={styles.statValue}>
                {lastResult.result.detectionSummary?.duplicateAlertCount ?? 0}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Detection checks</span>
              <span className={styles.statValue}>
                {lastResult.result.detectionSummary?.evaluatedAnchorCount ?? 0}
              </span>
            </div>
          </div>

          <Table
            rowKey={(record) => `${record.itemIndex}-${toArray(record.errors).join("|")}`}
            dataSource={toArray(lastResult.result.errors)}
            className={styles.table}
            columns={errorColumns}
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </div>
      ) : (
        <Paragraph className={styles.sectionLead}>
          Submit any intake workflow above to inspect the backend validation and creation result here.
        </Paragraph>
      )}
    </Card>
  );
};

export default IntakeResultPanel;
