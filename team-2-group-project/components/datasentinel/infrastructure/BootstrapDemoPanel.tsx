"use client";

import { Alert, Button, Card, Checkbox, Form, Input, Tag, Typography } from "antd";
import { useStyles } from "@/components/datasentinel/infrastructure/style/style";
import {
  useMonitoringInfrastructureActions,
  useMonitoringInfrastructureState,
} from "@/providers/monitoringInfrastructureProvider";
import { toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;

const BootstrapDemoPanel = () => {
  const { styles } = useStyles();
  const { bootstrapResult, canManageInfrastructure } = useMonitoringInfrastructureState();
  const { bootstrapDemo, clearMessages } = useMonitoringInfrastructureActions();
  const [bootstrapForm] = Form.useForm();

  return (
    <Card className={styles.pageCard}>
      <Title level={4} className={styles.sectionTitle}>
        Bootstrap demo infrastructure
      </Title>
      <Paragraph className={styles.sectionLead}>
        This is the quickest way to provision a usable tenant demo footprint for activity ingestion and simulation.
      </Paragraph>

      <div className={styles.splitGrid}>
        <Card className={styles.pageCard}>
          {canManageInfrastructure ? (
            <Form
              form={bootstrapForm}
              layout="vertical"
              initialValues={{
                serverName: "Demo PostgreSQL Cluster",
                environment: "Demo",
                includeTables: true,
              }}
              onFinish={async (values) => {
                clearMessages();
                await bootstrapDemo(values);
              }}
            >
              <Form.Item name="serverName" label="Server name">
                <Input />
              </Form.Item>
              <Form.Item name="hostName" label="Host name">
                <Input placeholder="Optional override" />
              </Form.Item>
              <Form.Item name="environment" label="Environment">
                <Input />
              </Form.Item>
              <Form.Item name="includeTables" valuePropName="checked">
                <Checkbox>Seed monitored tables as well</Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit">
                Bootstrap demo
              </Button>
            </Form>
          ) : (
            <Alert
              type="info"
              showIcon
              title="Demo bootstrap is available once the current user also has infrastructure manage permission."
            />
          )}
        </Card>

        <Card className={styles.pageCard}>
          <Title level={5} className={styles.sectionTitle}>
            Latest bootstrap result
          </Title>
          {bootstrapResult ? (
            <div className={styles.stackedCards}>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Servers created</span>
                  <span className={styles.statValue}>{bootstrapResult.createdServersCount}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Databases created</span>
                  <span className={styles.statValue}>{bootstrapResult.createdDatabasesCount}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Tables created</span>
                  <span className={styles.statValue}>{bootstrapResult.createdTablesCount}</span>
                </div>
              </div>

              <Paragraph className={styles.sectionLead}>
                The backend returned the updated server graph, so the UI can immediately reuse those references for intake.
              </Paragraph>

              <div className={styles.tagRow}>
                {toArray(bootstrapResult.servers).map((server) => (
                  <Tag key={server.id} className={styles.infoTag}>
                    {server.name}
                  </Tag>
                ))}
              </div>
            </div>
          ) : (
            <Paragraph className={styles.sectionLead}>
              Run the bootstrap action to create a demo cluster and see the counts returned by the backend.
            </Paragraph>
          )}
        </Card>
      </div>
    </Card>
  );
};

export default BootstrapDemoPanel;
