/**
 * Prompt builders for all DataSentinel AI features (Issue #7 — §6.9).
 * Each builder returns [systemPrompt, userPrompt] for the Groq API.
 * These run server-side only (imported by the app/api/ai route handlers).
 *
 *   buildSummaryPrompts             - #47 Alert Summary
 *   buildNextStepPrompts            - #52 Suggested Next Step
 *   buildSeverityRationalePrompts   - #53 High-Severity Rationale
 *   buildDashboardPosturePrompts    - 6.9 Posture Summary
 *   buildDashboardTopConcernPrompts - 6.9 Top Concern
 *   buildAlertsTriagePrompts        - 6.9 Triage Guidance
 *   buildActivityPatternPrompts     - 6.9 Pattern Summary
 */

import { ALERT_SEVERITY_OPTIONS, ALERT_STATUS_OPTIONS } from "@/constants/datasentinel/alerts";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";
import {
  IAiAlertContext,
  IAiDashboardContext,
  IAiAlertsTriageContext,
  IAiActivityContext,
} from "@/utils/datasentinel/aiService";

// ─── Shared helpers ───────────────────────────────────────────────────────────

export const getSeverityLabel = (severity: number): string =>
  ALERT_SEVERITY_OPTIONS.find((o) => o.value === severity)?.label ?? "Unknown";

export const getStatusLabel = (status: number): string =>
  ALERT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Unknown";

export const formatEventSample = (events: IActivityEventListItem[]): string => {
  if (!events.length) return "  (no individual events provided)";
  return events
    .slice(0, 10)
    .map((e) => {
      const time = new Date(e.eventTime).toISOString().replace("T", " ").slice(0, 19);
      const op = e.operation ?? "UNKNOWN_OP";
      const obj = e.objectName ?? e.databaseName ?? "unknown object";
      const rows = e.rowsAffected != null ? `${e.rowsAffected} rows` : "";
      const failSuffix = e.failureReason ? ` (${e.failureReason})` : "";
      const outcome = e.isSuccess ? "succeeded" : `FAILED${failSuffix}`;
      const duration = e.durationMs != null ? ` ${e.durationMs}ms` : "";
      return `  • ${time}  ${op} on ${obj}${rows ? "  " + rows : ""}  ${outcome}${duration}`;
    })
    .join("\n");
};

// ─── #47 Alert Summary ────────────────────────────────────────────────────────

/**
 * Expected output: 2-3 plain-language sentences — what the actor did and why
 * it was flagged.
 * Example: "User db_admin executed 340 INSERT operations on public.orders between
 * 02:00–03:00, 8× their typical overnight rate. This triggered the High Write
 * Volume rule, which flags bulk write bursts outside business hours as potential
 * exfiltration or bulk injection."
 */
export function buildSummaryPrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);

  const system = `You are a database security analyst AI for DataSentinel. Explain \
the security alert in concise plain language for a security analyst. Cover exactly \
two things: (1) what the actor did, (2) why it was flagged. 2-3 sentences maximum. \
Do not speculate beyond the data. Return the explanation directly — no preamble, no \
labels, no markdown.`;

  const user = `Explain what happened and why this alert was flagged.

Alert title       : ${alert.title}
Rule description  : ${alert.summary}
Severity          : ${getSeverityLabel(alert.severity)}
Status            : ${getStatusLabel(alert.status)}
Actor             : ${alert.primaryActorUser ?? "unknown"} (IP: ${alert.primaryActorIp ?? "unknown"})
Infrastructure    : ${[alert.serverName, alert.databaseName, alert.tableName].filter(Boolean).join(" → ") || "not specified"}
Alert triggered at: ${alert.triggeredAt}
Detection window  : ${alert.eventTimeStart} — ${alert.eventTimeEnd}
Total events      : ${alert.relatedEventCount}
Out-of-hours      : ${outOfHours ? "YES" : "NO"}
${recentEvents.length > 0 ? `\nSample events (${recentEvents.length} of ${alert.relatedEventCount} shown):\n${formatEventSample(recentEvents)}` : ""}

Explain what happened and why this activity was flagged as suspicious.`;

  return [system, user];
}

// ─── #52 Suggested Next Step ──────────────────────────────────────────────────

/**
 * Expected output: 1-2 concrete actionable sentences.
 * Example: "This actor has 3 prior unreviewed alerts on the same table — review
 * their full activity history for the past 7 days before changing status."
 */
export function buildNextStepPrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const { actorPriorOpenAlerts, actorPriorClosedAlerts, actorPriorAlertsOnSameTable } = ctx;
  const alertHour = new Date(alert.triggeredAt).getUTCHours();
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);

  const system = `You are a database security investigation advisor for DataSentinel. \
Suggest the single most important next investigation step. Be concrete — reference \
the actor name, table, or counts from the data. Return 1-2 sentences. No preamble, \
no bullets — a direct actionable instruction.`;

  const user = `What is the single most important next investigation step?

Alert title   : ${alert.title}
Alert status  : ${getStatusLabel(alert.status)}
Actor         : ${alert.primaryActorUser ?? "unknown"}
Affected      : ${[alert.databaseName, alert.tableName].filter(Boolean).join(".") || "unknown"}
Events in window           : ${alert.relatedEventCount}
Alert time (UTC)           : ${String(alertHour).padStart(2, "0")}:xx (${outOfHours ? "OUTSIDE business hours" : "within business hours"})
Actor prior OPEN alerts    : ${actorPriorOpenAlerts ?? "unknown"}
Actor prior CLOSED alerts  : ${actorPriorClosedAlerts ?? "unknown"}
Actor prior alerts on this table: ${actorPriorAlertsOnSameTable ?? "unknown"}`;

  return [system, user];
}

// ─── #53 High-Severity Rationale ─────────────────────────────────────────────

/**
 * Only called when severity >= 3. Expected output: 1-2 sentences explaining
 * the severity classification without modifying it.
 */
export function buildSeverityRationalePrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const severityLabel = getSeverityLabel(alert.severity);
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);

  const system = `You are a database security severity analyst for DataSentinel. \
Explain in 1-2 sentences why this alert was classified at the given severity level \
based on the rule and observed activity. You explain severity — you do NOT set, \
change, or question it. Return only the explanation — no preamble, no labels.`;

  const user = `Explain why this alert was assigned ${severityLabel} severity.

Alert title       : ${alert.title}
Rule description  : ${alert.summary}
Severity assigned : ${severityLabel} (${alert.severity}/4)
Actor             : ${alert.primaryActorUser ?? "unknown"}
Affected          : ${[alert.databaseName, alert.tableName].filter(Boolean).join(".") || "unknown"}
Total events      : ${alert.relatedEventCount}
Detection window  : ${alert.eventTimeStart} — ${alert.eventTimeEnd}
Out-of-hours      : ${outOfHours ? "YES" : "NO"}
Risk score        : ${alert.riskScore}/100`;

  return [system, user];
}

// ─── §6.9 Dashboard Posture Summary ──────────────────────────────────────────

/**
 * Expected output: 2-3 sentences summarising overall security state.
 * Example: "The environment shows elevated risk with 12 unreviewed alerts, 3
 * of which are critical, and 2 high-risk users with repeated out-of-hours
 * activity. Failed access attempts are 40% above the baseline for the window."
 */
export function buildDashboardPosturePrompts(ctx: IAiDashboardContext): [string, string] {
  const userLines = ctx.topRiskyUsers
    .map(
      (u) =>
        `  • ${u.actorUser}: score ${u.riskScore}/100, ${u.alertCount} alerts ` +
        `(${u.highSeverityAlertCount} high-sev), ${u.failedLoginCount} failed logins, ` +
        `${u.outOfHoursEventCount} out-of-hours events`,
    )
    .join("\n");

  const alertLines = ctx.recentAlerts
    .slice(0, 5)
    .map((a) => `  • [${getSeverityLabel(a.severity)}] ${a.title} — ${a.primaryActorUser ?? "unknown"}`)
    .join("\n");

  const system = `You are DataSentinel's security posture analyst. Summarise the \
current security state of this monitored environment in 2-3 plain-language sentences. \
Focus on the most significant risk signals. Return only the summary — no preamble, \
no markdown, no bullet points.`;

  const user = `Summarise the current security posture for this monitored environment.

Monitoring window : last ${ctx.windowDays} days
Total alerts      : ${ctx.totalAlerts} (${ctx.criticalAlerts} critical, ${ctx.newAlerts} unreviewed)
Failed access     : ${ctx.totalFailedAccessAttempts} attempts
Suspicious writes : ${ctx.suspiciousWriteActivityCount}
High-risk users   : ${ctx.highRiskUsersCount}
Anomaly timeline active buckets: ${ctx.anomalyBucketCount}
${userLines ? `\nTop risky users:\n${userLines}` : ""}
${alertLines ? `\nRecent alerts (${Math.min(ctx.recentAlerts.length, 5)} shown):\n${alertLines}` : ""}

What is the overall security posture of this environment?`;

  return [system, user];
}

// ─── §6.9 Dashboard Top Concern ──────────────────────────────────────────────

/**
 * Expected output: 1-2 sentences — single most urgent action to take.
 * Example: "Immediately investigate db_admin, who has 5 unreviewed high-severity
 * alerts and 12 out-of-hours events in the past 7 days."
 */
export function buildDashboardTopConcernPrompts(ctx: IAiDashboardContext): [string, string] {
  const userLines = ctx.topRiskyUsers
    .map(
      (u) =>
        `  • ${u.actorUser}: score ${u.riskScore}/100, ${u.alertCount} alerts, ` +
        `${u.outOfHoursEventCount} out-of-hours`,
    )
    .join("\n");

  const system = `You are DataSentinel's security advisor. Based on the data, \
identify the single most urgent action the security team should take right now. \
Be specific — name the actor, table, or alert type. Return 1-2 sentences. No \
preamble, no labels.`;

  const user = `What single action should the security team prioritise right now?

Window: last ${ctx.windowDays} days
Total alerts: ${ctx.totalAlerts} (${ctx.criticalAlerts} critical, ${ctx.newAlerts} unreviewed)
Failed access: ${ctx.totalFailedAccessAttempts}
High-risk users: ${ctx.highRiskUsersCount}
${userLines ? "\nTop risky actors:\n" + userLines : ""}`;

  return [system, user];
}

// ─── §6.9 Alerts Triage Guidance ─────────────────────────────────────────────

/**
 * Expected output: 2-3 sentences identifying which 1-2 alerts to action first.
 * Example: "Start with ALT-2024-0316 — it carries a risk score of 92 and the
 * actor has 4 prior unreviewed alerts on the same table. The second priority is
 * the out-of-hours bulk write alert from db_admin, given the critical severity."
 */
export function buildAlertsTriagePrompts(ctx: IAiAlertsTriageContext): [string, string] {
  const lines = ctx.alerts
    .slice(0, 15)
    .map(
      (a) =>
        `  • [${getSeverityLabel(a.severity)} / ${getStatusLabel(a.status)} / Risk:${a.riskScore}] ` +
        `${a.title} | Actor: ${a.primaryActorUser ?? "unknown"} | ` +
        `${[a.databaseName, a.tableName].filter(Boolean).join(".")} | ` +
        `${a.relatedEventCount} events | ${a.triggeredAt}`,
    )
    .join("\n");

  const system = `You are DataSentinel's alert triage advisor. Given the current \
alert queue, identify which 1-2 alerts the analyst should investigate first and \
briefly explain why. Reference alert titles, actors, risk scores, or event counts. \
2-3 sentences maximum. No preamble, no bullet points.`;

  const user = `Which alerts in this queue need immediate attention and why?

Total alerts in queue: ${ctx.totalCount}
Shown (${Math.min(ctx.alerts.length, 15)} of ${ctx.totalCount}):
${lines}`;

  return [system, user];
}

// ─── §6.9 Activity Pattern Summary ───────────────────────────────────────────

/**
 * Expected output: 2-3 sentences describing the most notable suspicious patterns.
 * Example: "Write operations are running at 3× normal rate, with 28 out-of-hours
 * events concentrated in the last 2 hours. 14 failed access attempts from
 * db_readonly suggest repeated unauthorised access attempts on public.payments."
 */
export function buildActivityPatternPrompts(ctx: IAiActivityContext): [string, string] {
  const viewLabelMap: Record<string, string> = {
    suspicious: "Suspicious activity only",
    failed: "Failed events only",
    all: "All events",
  };
  const viewLabel = viewLabelMap[ctx.activeTab] ?? "All events";

  const eventLines = ctx.sampleEvents
    .slice(0, 8)
    .map((e) => {
      const time = new Date(e.eventTime).toISOString().replace("T", " ").slice(0, 16);
      const obj = e.objectName ?? "unknown";
      const actor = e.actorUser ? ` by ${e.actorUser}` : "";
      const ooh = e.isOutOfHours ? " [OUT-OF-HOURS]" : "";
      const failReason = e.failureReason ? ": " + e.failureReason : "";
      const fail = e.isSuccess ? "" : ` [FAILED${failReason}]`;
      return `  • ${time}  ${e.operation ?? "OP"} on ${obj}${actor}${ooh}${fail}`;
    })
    .join("\n");

  const system = `You are DataSentinel's activity pattern analyst. Describe the \
most notable suspicious patterns in this database activity data in 2-3 plain-language \
sentences. Focus on anomalies — do not describe normal baseline activity. Return \
only the analysis — no preamble, no markdown.`;

  const user = `Identify suspicious patterns in this database activity monitoring data.

Current view      : ${viewLabel}
${ctx.actorUser ? `Filtered to actor : ${ctx.actorUser}\n` : ""}${ctx.operation ? `Filtered to op    : ${ctx.operation}\n` : ""}
Summary:
  Total events       : ${ctx.totalEvents}
  Read operations    : ${ctx.readOps}
  Write operations   : ${ctx.writeOps}
  Auth events        : ${ctx.authEvents}
  Privileged actions : ${ctx.privilegedOps}
  Suspicious events  : ${ctx.suspiciousActivityCount}
  Failed events      : ${ctx.failedEventsCount}
${eventLines ? `\nSample events (${ctx.sampleEvents.length} shown):\n${eventLines}` : ""}

What suspicious patterns are visible in this activity data?`;

  return [system, user];
}
