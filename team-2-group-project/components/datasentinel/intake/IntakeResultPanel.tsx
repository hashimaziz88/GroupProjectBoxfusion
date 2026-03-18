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
          </div>

          {toArray(lastResult.result.createdEventIds).length ? (
            <div className={styles.stackedCards}>
              <Text strong>Created activity event IDs</Text>
              <div className={styles.tagRow}>
                {toArray(lastResult.result.createdEventIds)
                  .slice(0, 12)
                  .map((id) => (
                    <Tag key={id} className={styles.infoTag}>
                      {id}
                    </Tag>
                  ))}
              </div>
            </div>
          ) : null}

          <Table
            rowKey={(record) => `${record.itemIndex}-${toArray(record.errors).join("|")}`}
            dataSource={toArray(lastResult.result.errors)}
            className={styles.table}
            columns={errorColumns}
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
