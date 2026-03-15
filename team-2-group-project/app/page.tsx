"use client";

import { Layout, Typography, Row, Col, Card, Tag, Space } from "antd";
import { useStyles } from "@/app/style/style";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const { styles } = useStyles();

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <Space direction="vertical" size="large" className={styles.stack}>
          <Tag className={styles.eyebrow}>Team 2 Frontend Starter</Tag>

          <div className={styles.intro}>
            <Title level={1} className={styles.title}>
              Build this project from the repo docs, not from ad hoc patterns.
            </Title>

            <Paragraph className={styles.description}>
              The workspace is now set up with local guidance for provider-based
              state, typed API wrappers, App Router structure, and consistent
              review rules.
            </Paragraph>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Card className={styles.card} title="Start Here">
                <Space direction="vertical" className={styles.list}>
                  <Text code>AGENTS.md</Text>
                  <Text code>.codex/context.md</Text>
                  <Text code>.codex/rules.md</Text>
                  <Text code>.codex/provider-pattern-contract.md</Text>
                  <Text code>.codex/review-checklist.md</Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className={styles.card} title="Required Shape">
                <Space direction="vertical" className={styles.list}>
                  <Text>
                    App Router route groups for auth and dashboard features
                  </Text>
                  <Text>Shared feature state inside provider modules</Text>
                  <Text>
                    Typed endpoint wrappers inside feature utils folders
                  </Text>
                  <Text>
                    Centralized contracts inside the types layer
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <Card className={styles.card}>
                <span className={styles.cardLabel}>Environment</span>

                <Paragraph>
                  Copy <Text code>.env.example</Text> to{" "}
                  <Text code>.env.local</Text> and set{" "}
                  <Text code>NEXT_PUBLIC_API_LINK</Text>.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card className={styles.card}>
                <span className={styles.cardLabel}>Packages</span>

                <Paragraph>
                  Install <Text code>antd</Text>, <Text code>antd-style</Text>,{" "}
                  <Text code>axios</Text>, <Text code>redux-actions</Text>, and{" "}
                  <Text code>@ant-design/icons</Text>.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>
    </Layout>
  );
}