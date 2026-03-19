import { Page, Route } from "@playwright/test";

type SessionMode =
  | "anonymous"
  | "tenant-context"
  | "tenant-admin"
  | "host-admin";

type AlertStatus = 0 | 1 | 2 | 3 | 4;

interface SetupMockAppOptions {
  session?: SessionMode;
}

interface MockUser {
  id: number;
  userName: string;
  name: string;
  surname: string;
  emailAddress: string;
  roles: string[];
}

interface MockTenant {
  tenantId: number | null;
  tenancyName: string | null;
}

interface MockTable {
  id: string;
  databaseId: string;
  schemaName: string;
  name: string;
  description?: string | null;
  isEnabled: boolean;
  lastActivityAt?: string | null;
}

interface MockDatabase {
  id: string;
  serverId: string;
  name: string;
  engine: string;
  description?: string | null;
  isEnabled: boolean;
  lastActivityAt?: string | null;
  tables: MockTable[];
}

interface MockServer {
  id: string;
  name: string;
  hostName: string;
  environment: string;
  description?: string | null;
  isEnabled: boolean;
  lastHeartbeatAt?: string | null;
  databases: MockDatabase[];
}

interface MockActivityEvent {
  id: string;
  eventId: string;
  eventTime: string;
  eventType: number;
  severity: number;
  actorUser: string;
  actorIp: string;
  objectName: string;
  operation: string;
  rowsAffected: number;
  durationMs: number;
  isOutOfHours: boolean;
  isSuccess: boolean;
  failureReason?: string | null;
  databaseId: string;
  databaseName: string;
  serverId: string;
  queryPreview: string;
}

interface MockAlert {
  id: string;
  alertId: string;
  title: string;
  summary: string;
  severity: number;
  riskScore: number;
  status: AlertStatus;
  triggeredAt: string;
  serverId: string;
  serverName: string;
  databaseId: string;
  databaseName: string;
  tableId: string;
  tableName: string;
  primaryActorUser: string;
  primaryActorIp: string;
  eventTimeStart: string;
  eventTimeEnd: string;
  relatedEventCount: number;
  recommendedActions: string[];
}

interface MockNote {
  id: string;
  alertId: string;
  body: string;
  isInternal: boolean;
  creationTime: string;
  creatorUserId?: number | null;
  creatorUserDisplayName?: string | null;
}

interface MockHistory {
  id: string;
  alertId: string;
  fromStatus: number;
  toStatus: number;
  comment?: string | null;
  creationTime: string;
  creatorUserId?: number | null;
  creatorUserDisplayName?: string | null;
}

interface MockState {
  users: Array<{
    id: number;
    userName: string;
    name: string;
    surname: string;
    fullName?: string | null;
    emailAddress: string;
    isActive: boolean;
    creationTime?: string | null;
    lastLoginTime?: string | null;
    roleNames?: string[] | null;
  }>;
  roles: Array<{
    id: number;
    name: string;
    displayName: string;
    normalizedName?: string | null;
    description?: string | null;
    grantedPermissions?: string[] | null;
    isStatic?: boolean;
    isDefault?: boolean;
    creationTime?: string | null;
  }>;
  tenants: Array<{
    id: number;
    tenancyName: string;
    name: string;
    isActive: boolean;
  }>;
  servers: MockServer[];
  activityEvents: MockActivityEvent[];
  alerts: MockAlert[];
  notes: Record<string, MockNote[]>;
  history: Record<string, MockHistory[]>;
}

const PERMISSIONS = {
  users: "Pages.Users",
  roles: "Pages.Roles",
  tenants: "Pages.Tenants",
  dataSentinelDashboard: "Pages.DataSentinel.Dashboard",
  dataSentinelIntake: "Pages.DataSentinel.Intake",
  dataSentinelInfrastructureView: "Pages.DataSentinel.Infrastructure.View",
  dataSentinelInfrastructureManage: "Pages.DataSentinel.Infrastructure.Manage",
  dataSentinelActivity: "Pages.DataSentinel.ActivityEvents.View",
  dataSentinelAlertsView: "Pages.DataSentinel.Alerts.View",
  dataSentinelAlertsReview: "Pages.DataSentinel.Alerts.Review",
  dataSentinelAlertsManage: "Pages.DataSentinel.Alerts.Manage",
  dataSentinelReportsExport: "Pages.DataSentinel.Reports.Export",
} as const;

const TENANT_ADMIN_PERMISSIONS = [
  PERMISSIONS.users,
  PERMISSIONS.roles,
  PERMISSIONS.dataSentinelDashboard,
  PERMISSIONS.dataSentinelIntake,
  PERMISSIONS.dataSentinelInfrastructureView,
  PERMISSIONS.dataSentinelInfrastructureManage,
  PERMISSIONS.dataSentinelActivity,
  PERMISSIONS.dataSentinelAlertsView,
  PERMISSIONS.dataSentinelAlertsReview,
  PERMISSIONS.dataSentinelAlertsManage,
  PERMISSIONS.dataSentinelReportsExport,
];

const HOST_ADMIN_PERMISSIONS = [
  PERMISSIONS.users,
  PERMISSIONS.roles,
  PERMISSIONS.tenants,
];

const TENANT_ADMIN_USER: MockUser = {
  id: 2,
  userName: "admin",
  name: "Ada",
  surname: "Analyst",
  emailAddress: "admin@defaulttenant.com",
  roles: ["Tenants.Admin"],
};

const HOST_ADMIN_USER: MockUser = {
  id: 1,
  userName: "hostadmin",
  name: "Harper",
  surname: "Host",
  emailAddress: "hostadmin@boxfusion.com",
  roles: ["Host.Admin"],
};

const TENANT_CONTEXT: MockTenant = {
  tenantId: 1,
  tenancyName: "Default",
};

const createJwt = (
  user: MockUser,
  permissions: string[],
  tenant?: MockTenant | null,
) => {
  const payload = {
    sub: `${user.id}`,
    exp: 2524608000,
    iat: 1760000000,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
      `${user.id}`,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
      user.userName,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
      user.emailAddress,
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
      user.roles,
    "http://www.aspnetboilerplate.com/identity/claims/tenantId":
      tenant?.tenantId ? `${tenant.tenantId}` : undefined,
    permissions,
  };

  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.mock-signature`;
};

const asAbpResponse = <T>(result: T) => ({
  result,
  targetUrl: null,
  success: true,
  error: null,
  unAuthorizedRequest: false,
  __abp: true,
});

const asAbpError = (message: string) => ({
  result: null,
  targetUrl: null,
  success: false,
  error: {
    code: 0,
    message,
    details: null,
    validationErrors: null,
  },
  unAuthorizedRequest: false,
  __abp: true,
});

const createInitialState = (): MockState => ({
  users: [
    {
      id: 2,
      userName: "admin",
      name: "Ada",
      surname: "Analyst",
      fullName: "Ada Analyst",
      emailAddress: "admin@defaulttenant.com",
      isActive: true,
      creationTime: "2026-03-01T08:00:00.000Z",
      lastLoginTime: "2026-03-18T07:45:00.000Z",
      roleNames: ["Tenants.Admin"],
    },
    {
      id: 7,
      userName: "jane.doe",
      name: "Jane",
      surname: "Doe",
      fullName: "Jane Doe",
      emailAddress: "jane.doe@defaulttenant.com",
      isActive: true,
      creationTime: "2026-03-03T10:00:00.000Z",
      lastLoginTime: "2026-03-18T07:50:00.000Z",
      roleNames: ["Analyst"],
    },
  ],
  roles: [
    {
      id: 1,
      name: "Tenants.Admin",
      displayName: "Tenant admin",
      description: "Tenant-wide administrator role.",
      grantedPermissions: TENANT_ADMIN_PERMISSIONS,
      isStatic: true,
      isDefault: false,
      creationTime: "2026-03-01T08:00:00.000Z",
    },
    {
      id: 3,
      name: "Analyst",
      displayName: "Security analyst",
      description: "Investigates alerts and reviews activity.",
      grantedPermissions: [
        PERMISSIONS.dataSentinelDashboard,
        PERMISSIONS.dataSentinelActivity,
        PERMISSIONS.dataSentinelAlertsView,
      ],
      isStatic: false,
      isDefault: false,
      creationTime: "2026-03-04T08:00:00.000Z",
    },
  ],
  tenants: [
    { id: 1, tenancyName: "Default", name: "Default Tenant", isActive: true },
    { id: 2, tenancyName: "Acme", name: "ACME", isActive: true },
  ],
  servers: [
    {
      id: "server-1",
      name: "SQL-PROD-01",
      hostName: "sql-prod-01.boxfusion.local",
      environment: "Production",
      description: "Primary production SQL node.",
      isEnabled: true,
      lastHeartbeatAt: "2026-03-18T08:15:00.000Z",
      databases: [
        {
          id: "database-1",
          serverId: "server-1",
          name: "FinanceDb",
          engine: "PostgreSQL",
          description: "Financial transactions database.",
          isEnabled: true,
          lastActivityAt: "2026-03-18T08:10:00.000Z",
          tables: [
            {
              id: "table-1",
              databaseId: "database-1",
              schemaName: "dbo",
              name: "Payments",
              description: "Outbound payment ledger.",
              isEnabled: true,
              lastActivityAt: "2026-03-18T08:08:00.000Z",
            },
            {
              id: "table-2",
              databaseId: "database-1",
              schemaName: "dbo",
              name: "AuditTrail",
              description: "Financial audit events.",
              isEnabled: true,
              lastActivityAt: "2026-03-18T08:04:00.000Z",
            },
          ],
        },
      ],
    },
    {
      id: "server-2",
      name: "SQL-UAT-01",
      hostName: "sql-uat-01.boxfusion.local",
      environment: "UAT",
      description: "User acceptance testing node.",
      isEnabled: true,
      lastHeartbeatAt: "2026-03-18T07:40:00.000Z",
      databases: [
        {
          id: "database-2",
          serverId: "server-2",
          name: "PeopleDb",
          engine: "PostgreSQL",
          description: "HR and identity database.",
          isEnabled: true,
          lastActivityAt: "2026-03-18T07:30:00.000Z",
          tables: [
            {
              id: "table-3",
              databaseId: "database-2",
              schemaName: "dbo",
              name: "Employees",
              description: "Employee master records.",
              isEnabled: true,
              lastActivityAt: "2026-03-18T07:15:00.000Z",
            },
          ],
        },
      ],
    },
  ],
  activityEvents: [
    {
      id: "activity-1",
      eventId: "ACT-0001",
      eventTime: "2026-03-18T07:55:00.000Z",
      eventType: 1,
      severity: 2,
      actorUser: "jane.doe",
      actorIp: "10.10.0.14",
      objectName: "dbo.Payments",
      operation: "SELECT",
      rowsAffected: 32,
      durationMs: 18,
      isOutOfHours: false,
      isSuccess: true,
      failureReason: null,
      databaseId: "database-1",
      databaseName: "FinanceDb",
      serverId: "server-1",
      queryPreview: "select * from dbo.Payments where status = 'Pending'",
    },
    {
      id: "activity-2",
      eventId: "ACT-0002",
      eventTime: "2026-03-18T08:05:00.000Z",
      eventType: 2,
      severity: 4,
      actorUser: "svc-import",
      actorIp: "10.10.0.20",
      objectName: "dbo.Payments",
      operation: "UPDATE",
      rowsAffected: 120,
      durationMs: 35,
      isOutOfHours: false,
      isSuccess: true,
      failureReason: null,
      databaseId: "database-1",
      databaseName: "FinanceDb",
      serverId: "server-1",
      queryPreview: "update dbo.Payments set status = 'Approved'",
    },
    {
      id: "activity-3",
      eventId: "ACT-0003",
      eventTime: "2026-03-18T23:40:00.000Z",
      eventType: 4,
      severity: 5,
      actorUser: "unknown.user",
      actorIp: "192.168.10.8",
      objectName: "dbo.Employees",
      operation: "LOGIN",
      rowsAffected: 0,
      durationMs: 11,
      isOutOfHours: true,
      isSuccess: false,
      failureReason: "Invalid password",
      databaseId: "database-2",
      databaseName: "PeopleDb",
      serverId: "server-2",
      queryPreview: "login failed for user unknown.user",
    },
  ],
  alerts: [
    {
      id: "alert-1",
      alertId: "ALT-1001",
      title: "Repeated failed logins detected",
      summary:
        "A single actor triggered multiple failed login attempts outside business hours.",
      severity: 5,
      riskScore: 92,
      status: 0,
      triggeredAt: "2026-03-18T23:41:00.000Z",
      serverId: "server-2",
      serverName: "SQL-UAT-01",
      databaseId: "database-2",
      databaseName: "PeopleDb",
      tableId: "table-3",
      tableName: "dbo.Employees",
      primaryActorUser: "unknown.user",
      primaryActorIp: "192.168.10.8",
      eventTimeStart: "2026-03-18T23:35:00.000Z",
      eventTimeEnd: "2026-03-18T23:41:00.000Z",
      relatedEventCount: 6,
      recommendedActions: [
        "Review the source IP and reset the user credentials if compromised.",
        "Correlate with firewall and identity provider logs.",
      ],
    },
    {
      id: "alert-2",
      alertId: "ALT-1002",
      title: "Suspicious write spike on finance ledger",
      summary:
        "Write volume on the payments table exceeded the baseline window.",
      severity: 4,
      riskScore: 76,
      status: 1,
      triggeredAt: "2026-03-18T08:06:00.000Z",
      serverId: "server-1",
      serverName: "SQL-PROD-01",
      databaseId: "database-1",
      databaseName: "FinanceDb",
      tableId: "table-1",
      tableName: "dbo.Payments",
      primaryActorUser: "svc-import",
      primaryActorIp: "10.10.0.20",
      eventTimeStart: "2026-03-18T07:58:00.000Z",
      eventTimeEnd: "2026-03-18T08:06:00.000Z",
      relatedEventCount: 14,
      recommendedActions: [
        "Validate the import job change window and deployment notes.",
        "Confirm the bulk update matches approved finance operations.",
      ],
    },
  ],
  notes: {
    "alert-1": [
      {
        id: "note-1",
        alertId: "alert-1",
        body: "Investigating source IP and cross-checking identity logs.",
        isInternal: true,
        creationTime: "2026-03-18T23:50:00.000Z",
        creatorUserId: 2,
        creatorUserDisplayName: "Ada Analyst",
      },
    ],
    "alert-2": [],
  },
  history: {
    "alert-1": [
      {
        id: "history-1",
        alertId: "alert-1",
        fromStatus: 0,
        toStatus: 0,
        comment: "Alert created by the rule engine.",
        creationTime: "2026-03-18T23:41:00.000Z",
        creatorUserId: 2,
        creatorUserDisplayName: "System",
      },
    ],
    "alert-2": [
      {
        id: "history-2",
        alertId: "alert-2",
        fromStatus: 0,
        toStatus: 1,
        comment: "Acknowledged by analyst.",
        creationTime: "2026-03-18T08:10:00.000Z",
        creatorUserId: 2,
        creatorUserDisplayName: "Ada Analyst",
      },
    ],
  },
});

const buildSession = (session: SessionMode) => {
  switch (session) {
    case "tenant-admin":
      return {
        token: createJwt(
          TENANT_ADMIN_USER,
          TENANT_ADMIN_PERMISSIONS,
          TENANT_CONTEXT,
        ),
        tenant: TENANT_CONTEXT,
        user: TENANT_ADMIN_USER,
        permissions: TENANT_ADMIN_PERMISSIONS,
      };
    case "host-admin":
      return {
        token: createJwt(HOST_ADMIN_USER, HOST_ADMIN_PERMISSIONS, null),
        tenant: null,
        user: HOST_ADMIN_USER,
        permissions: HOST_ADMIN_PERMISSIONS,
      };
    case "tenant-context":
      return {
        token: null,
        tenant: TENANT_CONTEXT,
        user: null,
        permissions: [] as string[],
      };
    default:
      return {
        token: null,
        tenant: null,
        user: null,
        permissions: [] as string[],
      };
  }
};

const getAllDatabases = (state: MockState) =>
  state.servers.flatMap((server) => server.databases);

const getAllTables = (state: MockState) =>
  getAllDatabases(state).flatMap((database) => database.tables);

const getParam = (url: URL, ...keys: string[]) => {
  for (const key of keys) {
    const value = url.searchParams.get(key);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const filterAlerts = (alerts: MockAlert[], url: URL) => {
  const keyword = getParam(url, "Keyword", "keyword")?.toLowerCase() ?? null;
  const severity = getParam(url, "Severity", "severity");
  const status = getParam(url, "Status", "status");
  const databaseId = getParam(url, "DatabaseId", "databaseId");

  return alerts.filter((alert) => {
    if (keyword) {
      const haystack =
        `${alert.title} ${alert.summary} ${alert.primaryActorUser} ${alert.databaseName}`.toLowerCase();
      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    if (severity !== null && `${alert.severity}` !== severity) {
      return false;
    }

    if (status !== null && `${alert.status}` !== status) {
      return false;
    }

    if (databaseId && alert.databaseId !== databaseId) {
      return false;
    }

    return true;
  });
};

const filterActivity = (events: MockActivityEvent[], url: URL) => {
  const keyword = getParam(url, "keyword", "Keyword")?.toLowerCase() ?? null;
  const serverId = getParam(url, "serverId", "ServerId");
  const databaseId = getParam(url, "databaseId", "DatabaseId");
  const actorUser = getParam(url, "actorUser", "ActorUser");
  const operation = getParam(url, "operation", "Operation");
  const tab = getParam(url, "tab", "Tab");
  const isSuccess = getParam(url, "isSuccess", "IsSuccess");

  return events.filter((event) => {
    if (keyword) {
      const haystack =
        `${event.eventId} ${event.actorUser} ${event.objectName} ${event.operation} ${event.databaseName}`.toLowerCase();
      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    if (serverId && event.serverId !== serverId) {
      return false;
    }

    if (databaseId && event.databaseId !== databaseId) {
      return false;
    }

    if (actorUser && event.actorUser !== actorUser) {
      return false;
    }

    if (operation && event.operation !== operation) {
      return false;
    }

    if (
      tab === "1" &&
      !(event.isOutOfHours || !event.isSuccess || Number(event.severity) >= 4)
    ) {
      return false;
    }

    if (tab === "2" && event.isSuccess) {
      return false;
    }

    if (isSuccess !== null) {
      const wanted = isSuccess === "true";
      if (event.isSuccess !== wanted) {
        return false;
      }
    }

    return true;
  });
};

const createDashboardTrendPoints = () => [
  { bucketStartUtc: "2026-03-17T00:00:00.000Z", count: 4 },
  { bucketStartUtc: "2026-03-18T00:00:00.000Z", count: 7 },
];

const jsonResponse = async (route: Route, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const pdfResponse = async (route: Route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/pdf",
    body: Buffer.from("%PDF-1.4 mock incident report"),
  });
};

const normalizeProxyPath = (url: URL) =>
  url.pathname.startsWith("/api/proxy")
    ? url.pathname.slice("/api/proxy".length) || "/"
    : url.pathname;

export async function setupMockApp(
  page: Page,
  options: SetupMockAppOptions = {},
) {
  const session = buildSession(options.session ?? "tenant-admin");
  const state = createInitialState();

  await page.addInitScript((seed) => {
    window.sessionStorage.clear();
    window.localStorage.clear();

    if (seed.token) {
      window.sessionStorage.setItem("access_token", seed.token);
    }

    if (seed.tenant?.tenantId) {
      window.sessionStorage.setItem("abp_tenant_id", `${seed.tenant.tenantId}`);
    }

    if (seed.tenant?.tenancyName) {
      window.sessionStorage.setItem(
        "abp_tenancy_name",
        `${seed.tenant.tenancyName}`,
      );
    }
  }, session);

  await page.route("**/api/ai/**", async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path.endsWith("/api/ai/dashboard-summary")) {
      return jsonResponse(route, {
        postureSummary:
          "Risk is concentrated in failed authentication activity and finance write spikes.",
        topConcern:
          "Investigate repeated failed logins first, then confirm the finance write burst is an approved batch job.",
      });
    }

    if (path.endsWith("/api/ai/alerts-triage")) {
      return jsonResponse(route, {
        triageGuidance:
          "Start with the high-severity failed login alert, then review the suspicious finance write spike for authorized change activity.",
      });
    }

    if (path.endsWith("/api/ai/analyze-alert")) {
      return jsonResponse(route, {
        summary:
          "The alert bundles repeated high-risk activity from a single actor in a short window.",
        nextStep:
          "Correlate the actor, source IP, and recent privileged actions before changing the alert status.",
        severityRationale:
          "The severity is driven by out-of-hours activity, repeated failures, and the sensitivity of the affected asset.",
      });
    }

    if (path.endsWith("/api/ai/activity-summary")) {
      return jsonResponse(route, {
        patternSummary:
          "Activity is dominated by normal reads, but a smaller cluster of failed and out-of-hours events is driving the suspicious pattern score.",
      });
    }

    return jsonResponse(route, {});
  });

  await page.route("**/api/proxy/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = normalizeProxyPath(url);
    const method = request.method().toUpperCase();
    const body = request.postDataJSON?.() as Record<string, unknown> | undefined;

    if (method === "GET" && path === "/AbpUserConfiguration/GetAll") {
      const permissions = Object.fromEntries(
        session.permissions.map((permission) => [permission, true]),
      );

      return jsonResponse(route, {
        auth: { grantedPermissions: permissions },
        multiTenancy: { isEnabled: true },
      });
    }

    if (method === "POST" && path === "/api/TokenAuth/Authenticate") {
      return jsonResponse(
        route,
        asAbpResponse({
          accessToken:
            session.token ??
            createJwt(TENANT_ADMIN_USER, TENANT_ADMIN_PERMISSIONS, TENANT_CONTEXT),
          encryptedAccessToken: "enc-mock-token",
          expireInSeconds: 3600,
          userId: TENANT_ADMIN_USER.id,
        }),
      );
    }

    if (
      method === "POST" &&
      path === "/api/services/app/Account/IsTenantAvailable"
    ) {
      const tenancyName = `${body?.tenancyName ?? ""}`.trim().toLowerCase();
      return jsonResponse(
        route,
        asAbpResponse(
          tenancyName === "default"
            ? { state: 1, tenantId: 1 }
            : { state: 3, tenantId: null },
        ),
      );
    }

    if (method === "POST" && path === "/api/services/app/Account/Register") {
      return jsonResponse(route, asAbpResponse({ canLogin: true }));
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Session/GetCurrentLoginInformations"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          user: session.user
            ? {
                id: session.user.id,
                userName: session.user.userName,
                name: session.user.name,
                surname: session.user.surname,
                emailAddress: session.user.emailAddress,
              }
            : null,
          tenant: session.tenant?.tenantId
            ? {
                id: session.tenant.tenantId,
                tenancyName: session.tenant.tenancyName,
              }
            : null,
        }),
      );
    }

    if (method === "GET" && path === "/api/services/app/User/GetAll") {
      return jsonResponse(
        route,
        asAbpResponse({ items: state.users, totalCount: state.users.length }),
      );
    }

    if (method === "GET" && path === "/api/services/app/User/GetRoles") {
      return jsonResponse(
        route,
        asAbpResponse({
          items: state.roles.map((role) => ({
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            isStatic: Boolean(role.isStatic),
            isDefault: Boolean(role.isDefault),
          })),
        }),
      );
    }

    if (method === "POST" && path === "/api/services/app/User/Create") {
      const nextId = Math.max(...state.users.map((user) => user.id)) + 1;
      const createdUser = {
        id: nextId,
        userName: `${body?.userName ?? "new.user"}`,
        name: `${body?.name ?? "New"}`,
        surname: `${body?.surname ?? "User"}`,
        fullName: `${body?.name ?? "New"} ${body?.surname ?? "User"}`,
        emailAddress: `${body?.emailAddress ?? "new.user@example.com"}`,
        isActive: Boolean(body?.isActive ?? true),
        creationTime: "2026-03-19T10:00:00.000Z",
        lastLoginTime: null,
        roleNames: Array.isArray(body?.roleNames)
          ? (body?.roleNames as string[])
          : [],
      };
      state.users.unshift(createdUser);
      return jsonResponse(route, asAbpResponse(createdUser));
    }

    if (method === "PUT" && path === "/api/services/app/User/Update") {
      const userId = Number(body?.id);
      const user = state.users.find((item) => item.id === userId);
      if (!user) {
        return jsonResponse(route, asAbpError("User not found."), 404);
      }
      Object.assign(user, {
        userName: `${body?.userName ?? user.userName}`,
        name: `${body?.name ?? user.name}`,
        surname: `${body?.surname ?? user.surname}`,
        fullName: `${body?.name ?? user.name} ${body?.surname ?? user.surname}`,
        emailAddress: `${body?.emailAddress ?? user.emailAddress}`,
        isActive: Boolean(body?.isActive ?? user.isActive),
        roleNames: Array.isArray(body?.roleNames)
          ? (body?.roleNames as string[])
          : user.roleNames,
      });
      return jsonResponse(route, asAbpResponse(user));
    }

    if (method === "DELETE" && path === "/api/services/app/User/Delete") {
      const id = Number(getParam(url, "Id", "id"));
      state.users = state.users.filter((user) => user.id !== id);
      return jsonResponse(route, {});
    }

    if (method === "POST" && path === "/api/services/app/User/Activate") {
      const user = state.users.find((item) => item.id === Number(body?.id));
      if (user) {
        user.isActive = true;
      }
      return jsonResponse(route, {});
    }

    if (method === "POST" && path === "/api/services/app/User/DeActivate") {
      const user = state.users.find((item) => item.id === Number(body?.id));
      if (user) {
        user.isActive = false;
      }
      return jsonResponse(route, {});
    }

    if (
      method === "POST" &&
      (path === "/api/services/app/User/ResetPassword" ||
        path === "/api/services/app/User/ChangePassword")
    ) {
      return jsonResponse(route, asAbpResponse(true));
    }

    if (method === "GET" && path === "/api/services/app/Role/GetAll") {
      return jsonResponse(
        route,
        asAbpResponse({ items: state.roles, totalCount: state.roles.length }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Role/GetAllPermissions"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          items: [
            { name: PERMISSIONS.users, displayName: "Users" },
            { name: PERMISSIONS.roles, displayName: "Roles" },
            { name: PERMISSIONS.dataSentinelDashboard, displayName: "Dashboard" },
            { name: PERMISSIONS.dataSentinelAlertsView, displayName: "Alerts View" },
          ],
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Role/GetRoleForEdit"
    ) {
      const id = Number(getParam(url, "Id", "id"));
      const role = state.roles.find((item) => item.id === id);
      return jsonResponse(
        route,
        asAbpResponse({
          role: role
            ? {
                id: role.id,
                name: role.name,
                displayName: role.displayName,
                description: role.description,
                isStatic: Boolean(role.isStatic),
              }
            : null,
          permissions: [
            { name: PERMISSIONS.users, displayName: "Users" },
            { name: PERMISSIONS.roles, displayName: "Roles" },
          ],
          grantedPermissionNames: role?.grantedPermissions ?? [],
        }),
      );
    }

    if (method === "POST" && path === "/api/services/app/Role/Create") {
      const nextId = Math.max(...state.roles.map((role) => role.id)) + 1;
      const role = {
        id: nextId,
        name: `${body?.name ?? "DataViewer"}`,
        displayName: `${body?.displayName ?? "Data Viewer"}`,
        description: `${body?.description ?? ""}`,
        grantedPermissions: Array.isArray(body?.grantedPermissions)
          ? (body?.grantedPermissions as string[])
          : [],
        isStatic: false,
        isDefault: false,
        creationTime: "2026-03-19T10:00:00.000Z",
      };
      state.roles.unshift(role);
      return jsonResponse(route, asAbpResponse(role));
    }

    if (method === "PUT" && path === "/api/services/app/Role/Update") {
      const id = Number(body?.id);
      const role = state.roles.find((item) => item.id === id);
      if (!role) {
        return jsonResponse(route, asAbpError("Role not found."), 404);
      }
      Object.assign(role, {
        name: `${body?.name ?? role.name}`,
        displayName: `${body?.displayName ?? role.displayName}`,
        description: `${body?.description ?? role.description ?? ""}`,
        grantedPermissions: Array.isArray(body?.grantedPermissions)
          ? (body?.grantedPermissions as string[])
          : role.grantedPermissions,
      });
      return jsonResponse(route, asAbpResponse(role));
    }

    if (method === "DELETE" && path === "/api/services/app/Role/Delete") {
      const id = Number(getParam(url, "Id", "id"));
      state.roles = state.roles.filter((role) => role.id !== id);
      return jsonResponse(route, {});
    }

    if (method === "GET" && path === "/api/services/app/Tenant/GetAll") {
      return jsonResponse(
        route,
        asAbpResponse({ items: state.tenants, totalCount: state.tenants.length }),
      );
    }

    if (method === "GET" && path === "/api/services/app/Tenant/Get") {
      const id = Number(getParam(url, "Id", "id"));
      const tenant = state.tenants.find((item) => item.id === id);
      return jsonResponse(
        route,
        asAbpResponse(
          tenant ?? {
            id,
            tenancyName: "Unknown",
            name: "Unknown",
            isActive: false,
          },
        ),
      );
    }

    if (method === "POST" && path === "/api/services/app/Tenant/Create") {
      const nextId = Math.max(...state.tenants.map((tenant) => tenant.id)) + 1;
      const tenant = {
        id: nextId,
        tenancyName: `${body?.tenancyName ?? "newtenant"}`,
        name: `${body?.name ?? "New Tenant"}`,
        isActive: Boolean(body?.isActive ?? true),
      };
      state.tenants.unshift(tenant);
      return jsonResponse(route, asAbpResponse(tenant));
    }

    if (method === "PUT" && path === "/api/services/app/Tenant/Update") {
      const id = Number(body?.id);
      const tenant = state.tenants.find((item) => item.id === id);
      if (!tenant) {
        return jsonResponse(route, asAbpError("Tenant not found."), 404);
      }
      Object.assign(tenant, {
        tenancyName: `${body?.tenancyName ?? tenant.tenancyName}`,
        name: `${body?.name ?? tenant.name}`,
        isActive: Boolean(body?.isActive ?? tenant.isActive),
      });
      return jsonResponse(route, asAbpResponse(tenant));
    }

    if (method === "DELETE" && path === "/api/services/app/Tenant/Delete") {
      const id = Number(getParam(url, "Id", "id"));
      state.tenants = state.tenants.filter((tenant) => tenant.id !== id);
      return jsonResponse(route, {});
    }

    if (
      method === "GET" &&
      path === "/api/services/app/MonitoringInfrastructure/GetMonitoredServers"
    ) {
      return jsonResponse(route, asAbpResponse({ items: state.servers }));
    }

    if (
      method === "GET" &&
      path === "/api/services/app/MonitoringInfrastructure/GetMonitoredDatabases"
    ) {
      const serverId = getParam(url, "serverId", "ServerId");
      const databases = serverId
        ? state.servers.find((server) => server.id === serverId)?.databases ?? []
        : getAllDatabases(state);
      return jsonResponse(route, asAbpResponse({ items: databases }));
    }

    if (
      method === "GET" &&
      path === "/api/services/app/MonitoringInfrastructure/GetMonitoredTables"
    ) {
      const databaseId = getParam(url, "databaseId", "DatabaseId");
      const tables = databaseId
        ? getAllDatabases(state).find((database) => database.id === databaseId)
            ?.tables ?? []
        : getAllTables(state);
      return jsonResponse(route, asAbpResponse({ items: tables }));
    }

    if (
      method === "POST" &&
      path === "/api/services/app/MonitoringInfrastructure/CreateMonitoredServer"
    ) {
      const nextId = `server-${state.servers.length + 1}`;
      const server: MockServer = {
        id: nextId,
        name: `${body?.name ?? "SQL-NEW-01"}`,
        hostName: `${body?.hostName ?? "sql-new-01.boxfusion.local"}`,
        environment: `${body?.environment ?? "Production"}`,
        description: `${body?.description ?? ""}`,
        isEnabled: Boolean(body?.isEnabled ?? true),
        lastHeartbeatAt: null,
        databases: [],
      };
      state.servers.unshift(server);
      return jsonResponse(route, asAbpResponse(server));
    }

    if (
      method === "POST" &&
      path === "/api/services/app/MonitoringInfrastructure/CreateMonitoredDatabase"
    ) {
      const server = state.servers.find((item) => item.id === `${body?.serverId}`);
      const database: MockDatabase = {
        id: `database-${getAllDatabases(state).length + 1}`,
        serverId: `${body?.serverId ?? "server-1"}`,
        name: `${body?.name ?? "NewDatabase"}`,
        engine: `${body?.engine ?? "PostgreSQL"}`,
        description: `${body?.description ?? ""}`,
        isEnabled: Boolean(body?.isEnabled ?? true),
        lastActivityAt: null,
        tables: [],
      };
      server?.databases.push(database);
      return jsonResponse(route, asAbpResponse(database));
    }

    if (
      method === "POST" &&
      path === "/api/services/app/MonitoringInfrastructure/CreateMonitoredTable"
    ) {
      const database = getAllDatabases(state).find(
        (item) => item.id === `${body?.databaseId}`,
      );
      const table: MockTable = {
        id: `table-${getAllTables(state).length + 1}`,
        databaseId: `${body?.databaseId ?? "database-1"}`,
        schemaName: `${body?.schemaName ?? "dbo"}`,
        name: `${body?.name ?? "NewTable"}`,
        description: `${body?.description ?? ""}`,
        isEnabled: Boolean(body?.isEnabled ?? true),
        lastActivityAt: null,
      };
      database?.tables.push(table);
      return jsonResponse(route, asAbpResponse(table));
    }

    if (
      method === "POST" &&
      path === "/api/services/app/MonitoringInfrastructure/BootstrapDemo"
    ) {
      if (!state.servers.some((server) => server.id === "server-demo")) {
        state.servers.push({
          id: "server-demo",
          name: "SQL-DEMO-01",
          hostName: "sql-demo-01.boxfusion.local",
          environment: "Demo",
          description: "Seeded demo infrastructure.",
          isEnabled: true,
          lastHeartbeatAt: "2026-03-19T11:00:00.000Z",
          databases: [
            {
              id: "database-demo",
              serverId: "server-demo",
              name: "DemoDb",
              engine: "PostgreSQL",
              description: "Seeded demo database.",
              isEnabled: true,
              lastActivityAt: "2026-03-19T11:00:00.000Z",
              tables: [
                {
                  id: "table-demo",
                  databaseId: "database-demo",
                  schemaName: "dbo",
                  name: "DemoTable",
                  description: "Seeded demo table.",
                  isEnabled: true,
                  lastActivityAt: "2026-03-19T11:00:00.000Z",
                },
              ],
            },
          ],
        });
      }
      return jsonResponse(
        route,
        asAbpResponse({
          createdServersCount: 1,
          createdDatabasesCount: 1,
          createdTablesCount: 1,
          servers: state.servers,
        }),
      );
    }

    if (method === "GET" && path === "/api/services/app/ActivityEvent/GetSummary") {
      const failed = state.activityEvents.filter((event) => !event.isSuccess).length;
      const suspicious = state.activityEvents.filter(
        (event) => event.isOutOfHours || event.severity >= 4 || !event.isSuccess,
      ).length;
      return jsonResponse(
        route,
        asAbpResponse({
          totalEvents: state.activityEvents.length,
          readOps: state.activityEvents.filter((event) => event.operation === "SELECT").length,
          writeOps: state.activityEvents.filter((event) =>
            ["INSERT", "UPDATE", "DELETE"].includes(event.operation),
          ).length,
          authEvents: state.activityEvents.filter((event) => event.operation === "LOGIN").length,
          privilegedOps: state.activityEvents.filter((event) => event.severity >= 4).length,
          suspiciousActivityCount: suspicious,
          failedEventsCount: failed,
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/ActivityEvent/GetFilterOptions"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          databases: getAllDatabases(state).map((database) => ({
            id: database.id,
            name: database.name,
          })),
          servers: state.servers.map((server) => ({
            id: server.id,
            name: server.name,
          })),
          users: Array.from(new Set(state.activityEvents.map((event) => event.actorUser))),
          ipAddresses: Array.from(
            new Set(state.activityEvents.map((event) => event.actorIp)),
          ),
          operations: Array.from(
            new Set(state.activityEvents.map((event) => event.operation)),
          ),
        }),
      );
    }

    if (method === "GET" && path === "/api/services/app/ActivityEvent/GetPaged") {
      const filtered = filterActivity(state.activityEvents, url);
      return jsonResponse(
        route,
        asAbpResponse({ items: filtered, totalCount: filtered.length }),
      );
    }

    if (
      method === "POST" &&
      [
        "/api/services/app/ActivityEvent/Ingest",
        "/api/services/app/ActivityEvent/IngestAbpAuditLogs",
        "/api/services/app/ActivityEvent/SeedSimulatedAbpAuditLogs",
        "/api/services/app/ActivityEvent/ImportBatch",
      ].includes(path)
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          receivedCount: 5,
          acceptedCount: 5,
          rejectedCount: 0,
          createdEventIds: [
            "created-event-1",
            "created-event-2",
            "created-event-3",
            "created-event-4",
            "created-event-5",
          ],
          errors: [],
        }),
      );
    }

    if (method === "GET" && path === "/api/services/app/SecurityAlert/GetPaged") {
      const alerts = filterAlerts(state.alerts, url);
      return jsonResponse(
        route,
        asAbpResponse({ items: alerts, totalCount: alerts.length }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/SecurityAlert/GetFilterOptions"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          databases: getAllDatabases(state).map((database) => ({
            id: database.id,
            name: database.name,
          })),
        }),
      );
    }

    if (method === "GET" && path === "/api/services/app/SecurityAlert/GetById") {
      const id = getParam(url, "id", "Id");
      const alert = state.alerts.find((item) => item.id === id);
      if (!alert) {
        return jsonResponse(route, asAbpError("Security alert not found."), 404);
      }
      return jsonResponse(route, asAbpResponse(alert));
    }

    if (
      method === "PUT" &&
      path === "/api/services/app/SecurityAlert/UpdateStatus"
    ) {
      const alert = state.alerts.find((item) => item.id === `${body?.alertId}`);
      if (alert) {
        const fromStatus = alert.status;
        alert.status = Number(body?.newStatus ?? alert.status) as AlertStatus;
        state.history[alert.id] = [
          {
            id: `history-${Date.now()}`,
            alertId: alert.id,
            fromStatus,
            toStatus: alert.status,
            comment: `${body?.comment ?? ""}`,
            creationTime: "2026-03-19T10:05:00.000Z",
            creatorUserId: TENANT_ADMIN_USER.id,
            creatorUserDisplayName: "Ada Analyst",
          },
          ...(state.history[alert.id] ?? []),
        ];
      }
      return jsonResponse(route, {});
    }

    if (
      method === "PUT" &&
      path === "/api/services/app/SecurityAlert/BulkUpdateStatus"
    ) {
      const alertIds = Array.isArray(body?.alertIds)
        ? (body?.alertIds as string[])
        : [];
      const newStatus = Number(body?.newStatus ?? 3) as AlertStatus;
      for (const alertId of alertIds) {
        const alert = state.alerts.find((item) => item.id === alertId);
        if (!alert) {
          continue;
        }
        const fromStatus = alert.status;
        alert.status = newStatus;
        state.history[alert.id] = [
          {
            id: `history-${alert.id}-${Date.now()}`,
            alertId: alert.id,
            fromStatus,
            toStatus: newStatus,
            comment: `${body?.comment ?? ""}`,
            creationTime: "2026-03-19T10:10:00.000Z",
            creatorUserId: TENANT_ADMIN_USER.id,
            creatorUserDisplayName: "Ada Analyst",
          },
          ...(state.history[alert.id] ?? []),
        ];
      }
      return jsonResponse(route, {});
    }

    if (method === "GET" && path === "/api/services/app/IncidentNote/GetByAlert") {
      const alertId = getParam(url, "alertId", "AlertId") ?? "";
      return jsonResponse(route, asAbpResponse(state.notes[alertId] ?? []));
    }

    if (method === "POST" && path === "/api/services/app/IncidentNote/Create") {
      const alertId = `${body?.alertId ?? ""}`;
      const note: MockNote = {
        id: `note-${Date.now()}`,
        alertId,
        body: `${body?.body ?? ""}`,
        isInternal: Boolean(body?.isInternal),
        creationTime: "2026-03-19T10:15:00.000Z",
        creatorUserId: TENANT_ADMIN_USER.id,
        creatorUserDisplayName: "Ada Analyst",
      };
      state.notes[alertId] = [note, ...(state.notes[alertId] ?? [])];
      return jsonResponse(route, asAbpResponse(note));
    }

    if (
      method === "GET" &&
      path === "/api/services/app/AlertStatusHistory/GetByAlert"
    ) {
      const alertId = getParam(url, "alertId", "AlertId") ?? "";
      return jsonResponse(route, asAbpResponse(state.history[alertId] ?? []));
    }

    if (method === "GET" && path === "/api/SecurityAlert/ExportReport") {
      return pdfResponse(route);
    }

    if (method === "GET" && path === "/api/services/app/Dashboards/GetSummary") {
      return jsonResponse(
        route,
        asAbpResponse({
          windowStartUtc: "2026-03-12T00:00:00.000Z",
          windowEndUtc: "2026-03-19T00:00:00.000Z",
          totalAlerts: state.alerts.length,
          criticalAlerts: state.alerts.filter((alert) => alert.severity >= 5).length,
          newAlerts: state.alerts.filter((alert) => alert.status === 0).length,
          totalFailedAccessAttempts: state.activityEvents.filter((event) => !event.isSuccess).length,
          suspiciousWriteActivityCount: state.activityEvents.filter(
            (event) =>
              ["UPDATE", "INSERT", "DELETE"].includes(event.operation) &&
              (event.severity >= 4 || event.isOutOfHours || !event.isSuccess),
          ).length,
          highRiskUsersCount: 2,
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Dashboards/GetActivityTrends"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          windowStartUtc: "2026-03-12T00:00:00.000Z",
          windowEndUtc: "2026-03-19T00:00:00.000Z",
          bucketHours: 24,
          reads: createDashboardTrendPoints(),
          writes: createDashboardTrendPoints(),
          failedAccess: createDashboardTrendPoints(),
          alerts: createDashboardTrendPoints(),
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Dashboards/GetAlertsBySeverity"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          windowStartUtc: "2026-03-12T00:00:00.000Z",
          windowEndUtc: "2026-03-19T00:00:00.000Z",
          items: [
            { severity: 2, count: 1 },
            { severity: 4, count: 1 },
            { severity: 5, count: 1 },
          ],
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Dashboards/GetAnomalyTimeline"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          windowStartUtc: "2026-03-12T00:00:00.000Z",
          windowEndUtc: "2026-03-19T00:00:00.000Z",
          bucketHours: 24,
          items: [
            {
              bucketStartUtc: "2026-03-17T00:00:00.000Z",
              suspiciousEventCount: 2,
              alertCount: 1,
              highSeverityAlertCount: 1,
            },
            {
              bucketStartUtc: "2026-03-18T00:00:00.000Z",
              suspiciousEventCount: 3,
              alertCount: 2,
              highSeverityAlertCount: 1,
            },
          ],
        }),
      );
    }

    if (
      method === "GET" &&
      path === "/api/services/app/Dashboards/GetTopRiskyUsersAndEntities"
    ) {
      return jsonResponse(
        route,
        asAbpResponse({
          windowStartUtc: "2026-03-12T00:00:00.000Z",
          windowEndUtc: "2026-03-19T00:00:00.000Z",
          users: [
            {
              actorUser: "unknown.user",
              actorIp: "192.168.10.8",
              riskScore: 92,
              riskLevel: 5,
              alertCount: 1,
              failedLoginCount: 6,
              privilegedActionCount: 0,
              highSeverityAlertCount: 1,
              outOfHoursEventCount: 3,
              lastEvaluatedAt: "2026-03-19T00:00:00.000Z",
            },
            {
              actorUser: "svc-import",
              actorIp: "10.10.0.20",
              riskScore: 76,
              riskLevel: 4,
              alertCount: 1,
              failedLoginCount: 0,
              privilegedActionCount: 3,
              highSeverityAlertCount: 0,
              outOfHoursEventCount: 0,
              lastEvaluatedAt: "2026-03-19T00:00:00.000Z",
            },
          ],
          databases: [
            {
              entityId: "database-1",
              name: "FinanceDb",
              alertCount: 1,
              highSeverityAlertCount: 0,
              lastAlertAtUtc: "2026-03-18T08:06:00.000Z",
            },
          ],
          tables: [
            {
              entityId: "table-1",
              name: "dbo.Payments",
              alertCount: 1,
              highSeverityAlertCount: 0,
              lastAlertAtUtc: "2026-03-18T08:06:00.000Z",
            },
          ],
        }),
      );
    }

    return jsonResponse(route, {});
  });

  return { state, session };
}
