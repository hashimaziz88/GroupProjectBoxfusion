import { ISecurityAlertListItem } from "./alerts";

export interface IDashboardWindowInput {
  windowDays: number;
}

export interface IDashboardTrendInput extends IDashboardWindowInput {
  bucketHours: number;
}

export interface ITopRiskInput extends IDashboardWindowInput {
  maxUsers: number;
  maxEntities: number;
}

export interface IDashboardSummary {
  windowStartUtc: string;
  windowEndUtc: string;
  totalAlerts: number;
  criticalAlerts: number;
  newAlerts: number;
  totalFailedAccessAttempts: number;
  suspiciousWriteActivityCount: number;
  highRiskUsersCount: number;
}

export interface IDashboardTrendPoint {
  bucketStartUtc: string;
  count: number;
}

export interface IDashboardActivityTrends {
  windowStartUtc: string;
  windowEndUtc: string;
  bucketHours: number;
  reads: IDashboardTrendPoint[];
  writes: IDashboardTrendPoint[];
  failedAccess: IDashboardTrendPoint[];
  alerts: IDashboardTrendPoint[];
}

export interface IDashboardSeverityPoint {
  severity: number | string;
  count: number;
}

export interface IDashboardSeverityBreakdown {
  windowStartUtc: string;
  windowEndUtc: string;
  items: IDashboardSeverityPoint[];
}

export interface IDashboardAnomalyTimelinePoint {
  bucketStartUtc: string;
  suspiciousEventCount: number;
  alertCount: number;
  highSeverityAlertCount: number;
}

export interface IDashboardAnomalyTimeline {
  windowStartUtc: string;
  windowEndUtc: string;
  bucketHours: number;
  items: IDashboardAnomalyTimelinePoint[];
}

export interface IDashboardRiskyUser {
  actorUser: string;
  actorIp?: string | null;
  riskScore: number;
  riskLevel: number | string;
  alertCount: number;
  failedLoginCount: number;
  privilegedActionCount: number;
  highSeverityAlertCount: number;
  outOfHoursEventCount: number;
  lastEvaluatedAt: string;
}

export interface IDashboardRiskEntity {
  entityId?: string | null;
  name: string;
  alertCount: number;
  highSeverityAlertCount: number;
  lastAlertAtUtc?: string | null;
}

export interface IDashboardTopRisk {
  windowStartUtc: string;
  windowEndUtc: string;
  users: IDashboardRiskyUser[];
  databases: IDashboardRiskEntity[];
  tables: IDashboardRiskEntity[];
}

export interface IDashboardFilterDraft {
  windowDays: number;
  bucketHours: number;
  maxUsers: number;
  maxEntities: number;
}

export interface IDashboardDataBundle {
  summary: IDashboardSummary;
  activityTrends: IDashboardActivityTrends;
  severityBreakdown: IDashboardSeverityBreakdown;
  anomalyTimeline: IDashboardAnomalyTimeline;
  topRisk: IDashboardTopRisk;
  recentAlerts: ISecurityAlertListItem[];
}
