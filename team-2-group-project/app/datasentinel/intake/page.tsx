"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Alert, Button, Card, Input, InputNumber, Switch, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { toArray } from "@/utils/helpers";

const { Paragraph, Title } = Typography;
const { TextArea } = Input;

const samplePayload = `[
  {
    "serverName": "Primary PostgreSQL Cluster",
    "databaseName": "IdentityVault",
    "eventTime": "2026-03-16T01:42:00Z",
    "eventType": 1,
    "actorUser": "unknown.root",
    "actorIp": "203.0.113.45",
    "objectName": "IdentityVault",
    "operation": "LOGIN",
    "durationMs": 82,
    "isSuccessful": false,
    "failureReason": "invalid_password"
  }
]`;

const IntakePageContent = () => {
  const { styles } = useStyles();
  const {
    monitoredServers,
    monitoredDatabases,
    intakeResult,
    errorMessage,
  } = useDataSentinelState();
  const { loadAssets, runActivityImport, runDemoGeneration } =
    useDataSentinelActions();
  const [eventCount, setEventCount] = useState(120);
  const [seed, setSeed] = useState<number | null>(42);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [runDetection, setRunDetection] = useState(true);
  const [payloadJson, setPayloadJson] = useState(samplePayload);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const loadAssetsOnMount = useEffectEvent(async () => {
    await loadAssets();
  });

  useEffect(() => {
    void loadAssetsOnMount();
  }, []);

  const servers = toArray(monitoredServers);
  const databases = toArray(monitoredDatabases);
  const result = intakeResult;

  return (
    <AppShell
      title="Demo Intake"
      subtitle="Generate simulated monitoring activity or import JSON activity events into the active tenant workspace."
    >
      {errorMessage ? (
        <Alert message={errorMessage} type="error" showIcon className={styles.alert} />
      ) : null}
      {result ? (
        <Alert
          message={`Created ${result.createdEventCount} events and ${result.createdAlertCount} alerts.`}
          description={toArray(result.scenarioNames).join(", ") || "Manual import or generation completed successfully."}
          type="success"
          showIcon
          className={styles.alert}
        />
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Servers</span>
          <span className={styles.statValue}>{servers.length}</span>
          <span className={styles.statHint}>Monitored environments available for demo generation.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Databases</span>
          <span className={styles.statValue}>{databases.length}</span>
          <span className={styles.statHint}>Database assets that imported or generated activity can target.</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <Card className={styles.pageCard}>
          <Title level={4} className={styles.sectionTitle}>
            Generate demo activity
          </Title>
          <Paragraph className={styles.sectionLead}>
            Seed the tenant with a credible mix of benign and suspicious SQL activity for the demo flow.
          </Paragraph>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputNumber
              min={20}
              max={1000}
              value={eventCount}
              onChange={(value) => setEventCount(Number(value || 20))}
              style={{ width: "100%" }}
            />
            <InputNumber
              min={1}
              max={9999}
              value={seed}
              onChange={(value) => setSeed(value === null ? null : Number(value))}
              style={{ width: "100%" }}
              placeholder="Random seed"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Switch checked={includeAnomalies} onChange={setIncludeAnomalies} />
              <span>Include suspicious scenarios</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Switch checked={runDetection} onChange={setRunDetection} />
              <span>Run detection immediately</span>
            </div>
            <Button
              type="primary"
              loading={isGenerating}
              onClick={() => {
                setIsGenerating(true);
                void runDemoGeneration({
                  eventCount,
                  seed,
                  includeAnomalies,
                  runDetection,
                })
                  .finally(() => {
                    setIsGenerating(false);
                  });
              }}
            >
              Generate dataset
            </Button>
          </div>
        </Card>

        <Card className={styles.pageCard}>
          <Title level={4} className={styles.sectionTitle}>
            Import JSON activity
          </Title>
          <Paragraph className={styles.sectionLead}>
            Paste a JSON array of activity events. Values are normalized and sensitive evidence strings are redacted server-side.
          </Paragraph>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TextArea
              rows={16}
              value={payloadJson}
              onChange={(event) => setPayloadJson(event.target.value)}
            />
            <Button
              loading={isImporting}
              onClick={() => {
                setIsImporting(true);
                void runActivityImport({
                  payloadJson,
                  runDetection,
                })
                  .finally(() => {
                    setIsImporting(false);
                  });
              }}
            >
              Import events
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default withAuth(IntakePageContent, PERMISSIONS.datasentinelIntake);
