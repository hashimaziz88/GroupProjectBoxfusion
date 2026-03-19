/**
 * Client-side AI service for DataSentinel alert analysis (Issue #7).
 *
 * All prompt logic and the Groq API key live server-side in:
 *   app/api/ai/analyze-alert/route.ts
 *
 * This file only defines the shared types and the thin fetch wrapper
 * that calls the internal Next.js API route.
 *
 * Features:
 *   #47 — AI-Generated Alert Summary and Explanation  (analysis.summary)
 *   #52 — Suggested Investigation Next Step           (analysis.nextStep)
 *   #53 — High-Severity Rationale (High/Critical only)(analysis.severityRationale)
 *   #54 — AiUnavailableError thrown on any failure — caller renders fallback panel
 */

import { ISecurityAlertDetail } from "@/interfaces/datasentinel/alerts";
import { IActivityEventListItem } from "@/interfaces/datasentinel/activity";

// ─── Shared types (also imported by the API route) ────────────────────────────

/** All context the caller must supply before calling generateAlertAnalysis. */
export interface IAiAlertContext {
  alert: ISecurityAlertDetail;
  /** Up to 10 representative activity events that triggered the alert. */
  recentEvents?: IActivityEventListItem[];
  /** Open alerts attributed to the same actor across all tables. */
  actorPriorOpenAlerts?: number;
  /** Resolved/dismissed alerts attributed to the same actor. */
  actorPriorClosedAlerts?: number;
  /** Prior alerts where actor AND affected table both match this alert. */
  actorPriorAlertsOnSameTable?: number;
}

/** Shape returned to the caller — each field maps to one AI panel section. */
export interface IAiAlertAnalysis {
  /** #47 — Plain-language explanation of what happened and why it was flagged. */
  summary: string;
  /** #52 — Single most actionable next investigation step. */
  nextStep: string;
  /**
   * #53 — Rationale for High/Critical severity assignment.
   * null when severity is Medium (2), Low (1), or Info (0).
   */
  severityRationale: string | null;
}

/** Thrown when the AI route is unreachable or returns an error (#54). */
export class AiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("AI analysis is temporarily unavailable.");
    this.name = "AiUnavailableError";
    this.cause = cause;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends alert context to the server-side AI route and returns the full analysis.
 *
 * Throws AiUnavailableError on network failure or a non-2xx response so callers
 * can render a graceful fallback panel per Issue #54.
 */
export async function generateAlertAnalysis(
  ctx: IAiAlertContext,
): Promise<IAiAlertAnalysis> {
  let response: Response;
  try {
    response = await fetch("/api/ai/analyze-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ctx),
    });
  } catch (networkError) {
    throw new AiUnavailableError(networkError);
  }

  if (!response.ok) {
    throw new AiUnavailableError(`API route returned HTTP ${response.status}`);
  }

  const json = await response.json();

  if (json.error) {
    throw new AiUnavailableError(json.error);
  }

  return json as IAiAlertAnalysis;
}
