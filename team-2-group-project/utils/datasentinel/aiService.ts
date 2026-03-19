/**
 * Client-side AI service for DataSentinel (Issue #7 — AI workflow §6.9).
 *
 * All prompt logic and the Groq API key live server-side in app/api/ai/.
 * This file only defines shared types and thin fetch wrappers.
 *
 * Alert detail  → /api/ai/analyze-alert   (#47 summary, #52 next step, #53 severity)
 * Dashboard     → /api/ai/dashboard-summary  (posture summary + top concern)
 * Alerts list   → /api/ai/alerts-triage      (triage guidance)
 * Activity      → /api/ai/activity-summary   (suspicious pattern summary)
 */

import { ISecurityAlertDetail } from "@/interfaces/datasentinel/alerts";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";

// ─── Shared error (#54) ───────────────────────────────────────────────────────

/** Thrown on network failure or non-2xx from any AI route. */
export class AiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("AI analysis is temporarily unavailable.");
    this.name = "AiUnavailableError";
    this.cause = cause;
  }
}

// ─── Alert detail (#47 / #52 / #53) ──────────────────────────────────────────

export interface IAiAlertContext {
  alert: ISecurityAlertDetail;
  recentEvents?: IActivityEventListItem[];
  actorPriorOpenAlerts?: number;
  actorPriorClosedAlerts?: number;
  actorPriorAlertsOnSameTable?: number;
}

export interface IAiAlertAnalysis {
  summary: string;
  nextStep: string;
  severityRationale: string | null;
}

export async function generateAlertAnalysis(ctx: IAiAlertContext): Promise<IAiAlertAnalysis> {
  return callAiRoute<IAiAlertAnalysis>("/api/ai/analyze-alert", ctx);
}

// ─── Dashboard posture ────────────────────────────────────────────────────────

export interface IAiDashboardContext {
  windowDays: number;
  totalAlerts: number;
  criticalAlerts: number;
  newAlerts: number;
  totalFailedAccessAttempts: number;
  suspiciousWriteActivityCount: number;
  highRiskUsersCount: number;
  anomalyBucketCount: number;
  topRiskyUsers: Array<{
    actorUser: string;
    riskScore: number;
    alertCount: number;
    highSeverityAlertCount: number;
    failedLoginCount: number;
    outOfHoursEventCount: number;
  }>;
  recentAlerts: Array<{
    title: string;
    severity: number;
    primaryActorUser?: string | null;
  }>;
}

export interface IAiDashboardAnalysis {
  /** 2-3 sentence plain-language summary of the current security posture. */
  postureSummary: string;
  /** Single most urgent action the security team should take right now. */
  topConcern: string;
}

export async function generateDashboardAnalysis(ctx: IAiDashboardContext): Promise<IAiDashboardAnalysis> {
  return callAiRoute<IAiDashboardAnalysis>("/api/ai/dashboard-summary", ctx);
}

// ─── Alerts triage ────────────────────────────────────────────────────────────

export interface IAiAlertsTriageContext {
  totalCount: number;
  alerts: Array<{
    title: string;
    severity: number;
    status: number;
    riskScore: number;
    relatedEventCount: number;
    triggeredAt: string;
    primaryActorUser?: string | null;
    databaseName?: string | null;
    tableName?: string | null;
  }>;
}

export interface IAiAlertsTriageAnalysis {
  /** 2-3 sentences: which 1-2 alerts to investigate first and why. */
  triageGuidance: string;
}

export async function generateAlertsTriageAnalysis(ctx: IAiAlertsTriageContext): Promise<IAiAlertsTriageAnalysis> {
  return callAiRoute<IAiAlertsTriageAnalysis>("/api/ai/alerts-triage", ctx);
}

// ─── Activity patterns ────────────────────────────────────────────────────────

export interface IAiActivityContext {
  totalEvents: number;
  readOps: number;
  writeOps: number;
  authEvents: number;
  privilegedOps: number;
  suspiciousActivityCount: number;
  failedEventsCount: number;
  activeTab: string;
  actorUser?: string;
  operation?: string;
  sampleEvents: Array<{
    eventTime: string;
    operation?: string | null;
    objectName?: string | null;
    actorUser?: string | null;
    isSuccess: boolean;
    isOutOfHours: boolean;
    failureReason?: string | null;
  }>;
}

export interface IAiActivityAnalysis {
  /** 2-3 sentences describing the suspicious patterns visible in the activity data. */
  patternSummary: string;
}

export async function generateActivityAnalysis(ctx: IAiActivityContext): Promise<IAiActivityAnalysis> {
  return callAiRoute<IAiActivityAnalysis>("/api/ai/activity-summary", ctx);
}

// ─── Internal helper ──────────────────────────────────────────────────────────

async function callAiRoute<T>(route: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new AiUnavailableError(networkError);
  }

  if (!response.ok) {
    throw new AiUnavailableError(`AI route ${route} returned HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.error) throw new AiUnavailableError(json.error);
  return json as T;
}
