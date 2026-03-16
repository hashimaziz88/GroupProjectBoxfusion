"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Button, Card, Input, InputNumber, Switch, Typography } from "antd";
import AppShell from "@/components/auth/AppShell";
import QueryState from "@/components/datasentinel/QueryState";
import SeverityTag from "@/components/datasentinel/SeverityTag";
import { withAuth } from "@/hoc/withAuth";
import { PERMISSIONS } from "@/constants/auth/roles";
import { useStyles } from "@/app/style/style";
import { useAuthState } from "@/providers/authProvider";
import { useDataSentinelActions, useDataSentinelState } from "@/providers/dataSentinelProvider";
import { IUpdateAlertRuleInput } from "@/interfaces/datasentinel";
import { toArray } from "@/utils/helpers";
import { hasPermission } from "@/utils/auth/roles";

const { Paragraph, Title } = Typography;

type TRuleDraftMap = Record<number, IUpdateAlertRuleInput>;

const RulesPageContent = () => {
  const { styles } = useStyles();
  const { permissions } = useAuthState();
  const { rules, isRulesPending, errorMessage } = useDataSentinelState();
  const { loadRules, saveRule } = useDataSentinelActions();
  const canManage = hasPermission(permissions, PERMISSIONS.datasentinelRulesManage);
  const [draftOverrides, setDraftOverrides] = useState<TRuleDraftMap>({});
  const [savingRuleId, setSavingRuleId] = useState<number | null>(null);
  const resolvedRules = toArray(rules);

  const loadRulesOnMount = useEffectEvent(async () => {
    await loadRules();
  });

  useEffect(() => {
    void loadRulesOnMount();
  }, []);

  const drafts = useMemo(
    () =>
      resolvedRules.reduce<TRuleDraftMap>((accumulator, rule) => {
        accumulator[rule.id] = draftOverrides[rule.id] ?? {
          id: rule.id,
          name: rule.name,
          description: rule.description || "",
          isEnabled: rule.isEnabled,
          ruleType: rule.ruleType,
          eventType: rule.eventType,
          windowMinutes: rule.windowMinutes,
          thresholdCount: rule.thresholdCount,
          groupByField: rule.groupByField || "",
          severity: rule.severity,
        };
        return accumulator;
      }, {}),
    [draftOverrides, resolvedRules],
  );

  const enabledCount = useMemo(
    () => resolvedRules.filter((rule) => rule.isEnabled).length,
    [resolvedRules],
  );

  const updateDraft = (ruleId: number, nextDraft: Partial<IUpdateAlertRuleInput>) => {
    setDraftOverrides((current) => ({
      ...current,
      [ruleId]: {
        ...drafts[ruleId],
        ...nextDraft,
      },
    }));
  };

  return (
    <AppShell
      title="Alert Rules"
      subtitle="Review deterministic anomaly rules, tune thresholds, and enable or disable rule coverage for the tenant."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Loaded rules</span>
          <span className={styles.statValue}>{resolvedRules.length}</span>
          <span className={styles.statHint}>Current DataSentinel detectors for this tenant.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Enabled</span>
          <span className={styles.statValue}>{enabledCount}</span>
          <span className={styles.statHint}>Rules actively generating security alerts.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Manage access</span>
          <span className={styles.statValue} style={{ fontSize: 22 }}>
            {canManage ? "Granted" : "View only"}
          </span>
          <span className={styles.statHint}>Editing is restricted by `Pages.DataSentinel.Rules.Manage`.</span>
        </div>
      </div>

      <QueryState
        isLoading={isRulesPending}
        errorMessage={errorMessage}
        isEmpty={!resolvedRules.length}
        emptyDescription="No alert rules are currently available for this tenant."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {resolvedRules.map((rule) => {
            const draft = drafts[rule.id];

            return (
              <Card key={rule.id} className={styles.pageCard}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 1fr)",
                    gap: 18,
                  }}
                >
                  <div>
                    <Title level={4} className={styles.sectionTitle}>
                      {rule.name}
                    </Title>
                    <Paragraph className={styles.sectionLead}>
                      {rule.description || "No rule description available."}
                    </Paragraph>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <SeverityTag severity={rule.severity} />
                      <span style={{ color: "#64748b" }}>
                        {rule.triggeredAlertCount} alerts triggered
                      </span>
                      <span style={{ color: "#64748b" }}>
                        Window {rule.windowMinutes} min • Threshold {rule.thresholdCount}
                      </span>
                    </div>
                  </div>

                  {draft ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Input
                        value={draft.name}
                        disabled={!canManage}
                        onChange={(event) =>
                          updateDraft(rule.id, { name: event.target.value })
                        }
                        placeholder="Rule name"
                      />
                      <Input
                        value={draft.groupByField}
                        disabled={!canManage}
                        onChange={(event) =>
                          updateDraft(rule.id, { groupByField: event.target.value })
                        }
                        placeholder="Group by field"
                      />
                      <InputNumber
                        min={1}
                        max={1440}
                        value={draft.windowMinutes}
                        disabled={!canManage}
                        onChange={(value) =>
                          updateDraft(rule.id, { windowMinutes: Number(value || 1) })
                        }
                        style={{ width: "100%" }}
                      />
                      <InputNumber
                        min={1}
                        max={100000}
                        value={draft.thresholdCount}
                        disabled={!canManage}
                        onChange={(value) =>
                          updateDraft(rule.id, { thresholdCount: Number(value || 1) })
                        }
                        style={{ width: "100%" }}
                      />
                      <Input
                        value={draft.description}
                        disabled={!canManage}
                        onChange={(event) =>
                          updateDraft(rule.id, { description: event.target.value })
                        }
                        placeholder="Description"
                        style={{ gridColumn: "1 / span 2" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Switch
                          checked={draft.isEnabled}
                          disabled={!canManage}
                          onChange={(checked) => updateDraft(rule.id, { isEnabled: checked })}
                        />
                        <span>Enabled</span>
                      </div>
                      <Button
                        type="primary"
                        disabled={!canManage}
                        loading={savingRuleId === rule.id}
                        onClick={() => {
                          setSavingRuleId(rule.id);
                          void saveRule(draft)
                            .then((updatedRule) => {
                              if (!updatedRule) {
                                return;
                              }
                              setDraftOverrides((current) => ({
                                ...current,
                                [updatedRule.id]: {
                                  id: updatedRule.id,
                                  name: updatedRule.name,
                                  description: updatedRule.description || "",
                                  isEnabled: updatedRule.isEnabled,
                                  ruleType: updatedRule.ruleType,
                                  eventType: updatedRule.eventType,
                                  windowMinutes: updatedRule.windowMinutes,
                                  thresholdCount: updatedRule.thresholdCount,
                                  groupByField: updatedRule.groupByField || "",
                                  severity: updatedRule.severity,
                                },
                              }));
                            })
                            .finally(() => {
                              setSavingRuleId(null);
                            });
                        }}
                      >
                        Save rule
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </QueryState>
    </AppShell>
  );
};

export default withAuth(RulesPageContent, PERMISSIONS.datasentinelRulesView);
