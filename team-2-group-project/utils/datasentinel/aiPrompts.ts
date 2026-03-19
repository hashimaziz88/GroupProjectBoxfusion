/**
 * Prompt builders for DataSentinel AI alert analysis (Issue #7).
 *
 * Each builder returns [systemPrompt, userPrompt] consumed by the Groq API.
 * These run server-side only (imported by app/api/ai/analyze-alert/route.ts).
 *
 *   buildSummaryPrompts        → #47 Alert Summary and Explanation
 *   buildNextStepPrompts       → #52 Suggested Investigation Next Step
 *   buildSeverityRationalePrompts → #53 High-Severity Rationale
 */

import { IAiAlertContext } from "@/utils/datasentinel/aiService";
import { getSeverityLabel, getStatusLabel, formatEventSample } from "@/utils/datasentinel/aiHelpers";

/**
 * #47 — Alert Summary
 *
 * Expected output: 2-3 plain-language sentences covering "what happened"
 * and "why it was flagged". Example:
 *   "User db_admin executed 340 INSERT operations against public.orders between
 *    02:00 and 03:00, 8× their typical overnight rate. This triggered the High
 *    Write Volume rule, which flags bulk write bursts outside normal business
 *    hours as potential exfiltration or bulk injection activity."
 */
export function buildSummaryPrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);
  const eventSample = formatEventSample(recentEvents);

  const system = `You are a database security analyst AI assistant for DataSentinel, \
a database activity monitoring platform. Explain the security alert in concise, plain \
language suitable for a security analyst. Cover exactly two things: (1) what the actor \
did, and (2) why it was flagged as suspicious. Use 2-3 sentences maximum. Do not \
speculate beyond the data provided. Return the explanation directly — no preamble, \
no labels, no markdown.`;

  const user = `Explain what happened in this security alert and why it was flagged.

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
${recentEvents.length > 0 ? `\nSample events (${recentEvents.length} of ${alert.relatedEventCount} shown):\n${eventSample}` : ""}

Explain what happened and why this activity was flagged as suspicious.`;

  return [system, user];
}

/**
 * #52 — Suggested Investigation Next Step
 *
 * Expected output: 1-2 sentences with a single, specific actionable step.
 * Example:
 *   "This actor has 3 prior unreviewed alerts on the same table — review their
 *    full activity history for the past 7 days before changing the alert status."
 */
export function buildNextStepPrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const { actorPriorOpenAlerts, actorPriorClosedAlerts, actorPriorAlertsOnSameTable } = ctx;
  const alertHour = new Date(alert.triggeredAt).getUTCHours();
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);

  const priorOpen = actorPriorOpenAlerts != null ? String(actorPriorOpenAlerts) : "unknown";
  const priorClosed = actorPriorClosedAlerts != null ? String(actorPriorClosedAlerts) : "unknown";
  const priorSameTable = actorPriorAlertsOnSameTable != null ? String(actorPriorAlertsOnSameTable) : "unknown";

  const system = `You are a database security investigation advisor for DataSentinel. \
Suggest the single most important next investigation step for the analyst. Be concrete \
— reference the actor name, table, or counts from the data when relevant. Return 1-2 \
sentences only. No preamble, no bullet points — a direct actionable instruction.`;

  const user = `Based on this security alert, what is the single most important next investigation step?

Alert title   : ${alert.title}
Alert status  : ${getStatusLabel(alert.status)}
Actor         : ${alert.primaryActorUser ?? "unknown"}
Affected      : ${[alert.databaseName, alert.tableName].filter(Boolean).join(".") || "unknown table"}
Events in window          : ${alert.relatedEventCount}
Alert time (UTC hour)     : ${String(alertHour).padStart(2, "0")}:xx (${outOfHours ? "OUTSIDE business hours" : "within business hours"})
Actor prior OPEN alerts   : ${priorOpen}
Actor prior CLOSED alerts : ${priorClosed}
Actor prior alerts on THIS table: ${priorSameTable}

What is the single most important next step for the analyst?`;

  return [system, user];
}

/**
 * #53 — High-Severity Rationale
 *
 * Only called when alert.severity >= HIGH_SEVERITY_THRESHOLD (High or Critical).
 *
 * Expected output: 1-2 sentences explaining the severity classification.
 * The model is explicitly told it does NOT set or change severity.
 * Example:
 *   "Critical severity applies when bulk writes exceed 500 operations in under
 *    5 minutes — a pattern consistent with automated exfiltration; this alert
 *    recorded 680 writes, 36% above threshold."
 */
export function buildSeverityRationalePrompts(ctx: IAiAlertContext): [string, string] {
  const { alert, recentEvents = [] } = ctx;
  const severityLabel = getSeverityLabel(alert.severity);
  const outOfHours = recentEvents.some((e) => e.isOutOfHours);

  const system = `You are a database security severity analyst for DataSentinel. \
Explain in 1-2 sentences why this alert was classified at the given severity level, \
based on the rule conditions and observed activity. You explain severity — you do NOT \
set, change, or question it. The rule engine is the single source of truth for \
severity; you are providing context to help the analyst understand why that level was \
assigned. Return only the explanation — no preamble, no labels, no markdown.`;

  const user = `Explain why this alert was assigned ${severityLabel} severity by the rule engine.

Alert title       : ${alert.title}
Rule description  : ${alert.summary}
Severity assigned : ${severityLabel} (${alert.severity}/4)
Actor             : ${alert.primaryActorUser ?? "unknown"}
Affected          : ${[alert.databaseName, alert.tableName].filter(Boolean).join(".") || "unknown"}
Total events      : ${alert.relatedEventCount}
Detection window  : ${alert.eventTimeStart} — ${alert.eventTimeEnd}
Out-of-hours      : ${outOfHours ? "YES" : "NO"}
Risk score        : ${alert.riskScore}/100

Why was ${severityLabel} severity assigned to this alert?`;

  return [system, user];
}
