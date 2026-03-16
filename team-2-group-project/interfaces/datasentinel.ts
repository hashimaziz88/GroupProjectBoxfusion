import { IPagedResult } from "@/interfaces/auth/adminService";

export interface IListResult<T> {
  items?: T[] | null;
}

export interface IGetDashboardOverviewInput {
  windowDays?: number;
}

export interface IDashboardSeverityCount {
  severity: number;
  count: number;
}

export interface IDashboardStatusCount {
  status: number;
  count: number;
}

export interface IDashboardTrendPoint {
  label: string;
  count: number;
}

export interface IDashboardActivityPoint {
  label: string;
  reads: number;
  writes: number;
  failedLogins: number;
}

export interface IDashboardRiskActor {
  actorUser: string;
  riskScore: number;
  alertCount: number;
  eventCount: number;
  topIndicator?: string | null;
}

export interface IDashboardRecentAlert {
  id: number;
  title: string;
  severity: number;
  status: number;
  actorUser?: string | null;
  ruleName?: string | null;
  relativeHint?: string | null;
}

export interface IDashboardOverview {
  activeAlertCount: number;
  criticalAlertCount: number;
  inProgressAlertCount: number;
  resolvedTodayCount: number;
  totalEventCount: number;
  failedLoginCount: number;
  privilegedActionCount: number;
  largeReadEventCount: number;
  monitoredServerCount: number;
  monitoredDatabaseCount: number;
  enabledRuleCount: number;
  alertsBySeverity?: IDashboardSeverityCount[] | null;
  alertsByStatus?: IDashboardStatusCount[] | null;
  anomalyTrend?: IDashboardTrendPoint[] | null;
  activitySeries?: IDashboardActivityPoint[] | null;
  topRiskActors?: IDashboardRiskActor[] | null;
  recentAlerts?: IDashboardRecentAlert[] | null;
}

export interface IGetAlertsInput {
  keyword?: string;
  severity?: number;
  status?: number;
  actorUser?: string;
  serverId?: number;
  databaseId?: number;
  objectName?: string;
  dateFromUtc?: string;
  dateToUtc?: string;
  openOnly?: boolean;
  skipCount?: number;
  maxResultCount?: number;
}

export interface ISecurityAlertListItem {
  id: number;
  ruleName?: string | null;
  title: string;
  summary?: string | null;
  severity: number;
  status: number;
  primaryActorUser?: string | null;
  primaryActorIp?: string | null;
  createdAt: string;
  eventTimeStart: string;
  eventTimeEnd: string;
  relatedEventCount: number;
}

export interface IIncidentNote {
  id: number;
  createdAt: string;
  createdByUserId?: number | null;
  createdByName?: string | null;
  body: string;
  isInternal: boolean;
}

export interface IAlertStatusHistory {
  id: number;
  changedAt: string;
  changedByUserId?: number | null;
  changedByName?: string | null;
  fromStatus: number;
  toStatus: number;
  comment?: string | null;
}

export interface ISecurityAlertRelatedEvent {
  id: number;
  serverName?: string | null;
  databaseName?: string | null;
  eventTime: string;
  eventType: number;
  actorUser?: string | null;
  actorIp?: string | null;
  objectName?: string | null;
  operation?: string | null;
  rowsAffected?: number | null;
  durationMs: number;
  isSuccessful: boolean;
  isOutOfHours: boolean;
  isPrivilegedAction: boolean;
  severity: number;
  querySignature?: string | null;
  failureReason?: string | null;
  evidenceJson?: string | null;
}

export interface ISecurityAlertDetail extends ISecurityAlertListItem {
  ruleId: number;
  ruleDescription?: string | null;
  topEvidenceJson?: string | null;
  notes?: IIncidentNote[] | null;
  statusHistory?: IAlertStatusHistory[] | null;
  relatedEvents?: ISecurityAlertRelatedEvent[] | null;
}

export interface IUpdateAlertStatusInput {
  alertId: number;
  status: number;
  comment?: string;
}

export interface ICreateIncidentNoteInput {
  alertId: number;
  body: string;
  isInternal: boolean;
}

export interface IAlertRuleListItem {
  id: number;
  name: string;
  description?: string | null;
  isEnabled: boolean;
  ruleType: number;
  eventType?: number | null;
  windowMinutes: number;
  thresholdCount: number;
  groupByField?: string | null;
  severity: number;
  triggeredAlertCount: number;
  lastTriggeredAt?: string | null;
}

export interface IUpdateAlertRuleInput {
  id: number;
  name: string;
  description?: string;
  isEnabled: boolean;
  ruleType: number;
  eventType?: number | null;
  windowMinutes: number;
  thresholdCount: number;
  groupByField?: string;
  severity: number;
}

export interface IGetActivityEventsInput {
  keyword?: string;
  serverId?: number;
  databaseId?: number;
  eventType?: number;
  severity?: number;
  isSuccessful?: boolean;
  isOutOfHours?: boolean;
  dateFromUtc?: string;
  dateToUtc?: string;
  skipCount?: number;
  maxResultCount?: number;
}

export interface IActivityEventListItem {
  id: number;
  serverName?: string | null;
  databaseName?: string | null;
  eventTime: string;
  eventType: number;
  actorUser?: string | null;
  actorIp?: string | null;
  objectName?: string | null;
  operation?: string | null;
  rowsAffected?: number | null;
  durationMs: number;
  isSuccessful: boolean;
  isOutOfHours: boolean;
  isPrivilegedAction: boolean;
  severity: number;
  querySignature?: string | null;
  failureReason?: string | null;
}

export interface IGenerateDemoActivityInput {
  eventCount: number;
  seed?: number | null;
  includeAnomalies: boolean;
  runDetection: boolean;
}

export interface IImportActivityEventsInput {
  payloadJson: string;
  runDetection: boolean;
}

export interface IMonitoringIntakeResult {
  createdEventCount: number;
  createdAlertCount: number;
  createdAlertIds?: number[] | null;
  scenarioNames?: string[] | null;
}

export interface IMonitoredServer {
  id: number;
  name: string;
  hostName?: string | null;
  environmentName?: string | null;
  region?: string | null;
  description?: string | null;
  isActive: boolean;
}

export interface IMonitoredDatabase {
  id: number;
  serverId: number;
  serverName?: string | null;
  name: string;
  engine?: string | null;
  owner?: string | null;
  description?: string | null;
  isActive: boolean;
}

export type IAlertListResult = IPagedResult<ISecurityAlertListItem>;
export type IActivityEventResult = IPagedResult<IActivityEventListItem>;
