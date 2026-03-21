# DataSentinel Frontend

This directory contains the Next.js frontend for DataSentinel. It provides the user-facing experience for authentication, tenant-aware access, security dashboards, monitored infrastructure management, activity review, alert investigation, intake workflows, reporting, and AI-assisted summaries.

This document is the frontend contributor guide for setup, environment configuration, backend integration, route structure, and testing.

## What Lives Here

The frontend is a Next.js App Router application built with:

- Next.js 16
- React 19
- TypeScript
- Ant Design and `antd-style`
- Axios for backend communication
- Playwright for end-to-end coverage

## Frontend Responsibilities

The frontend is responsible for:

- login, registration, session bootstrap, and tenant selection flows
- permission-aware navigation and protected application areas
- rendering DataSentinel dashboards, alert workspaces, infrastructure pages, intake flows, and reports
- calling the ASP.NET Core backend for auth, monitoring, dashboard, intake, and alert workflows
- exposing server-side Next.js routes for backend proxying and optional AI summaries

## Route Groups

The app currently includes these main route areas:

- public/auth routes under `app/(auth)` for login and registration
- public marketing and shell routes such as `landing`, `home`, `about`, `profile`, and `update-password`
- admin routes for `users`, `roles`, and `tenants`
- DataSentinel routes under `app/datasentinel`:
  - `dashboard`
  - `infrastructure`
  - `intake`
  - `activity`
  - `alerts`
  - `reports`
- local API routes under `app/api`:
  - `app/api/proxy/[...path]`
  - `app/api/ai/activity-summary`
  - `app/api/ai/dashboard-summary`
  - `app/api/ai/analyze-alert`
  - `app/api/ai/alerts-triage`

## Architecture Overview

The frontend is organized around App Router pages, reusable UI, provider-driven state, and typed integration helpers.

- `app` - route entrypoints, layouts, and local API routes
- `components` - shared UI and DataSentinel feature components
- `providers` - state containers for auth, admin, dashboards, monitoring, alerts, activity, and report export workflows
- `utils` - API clients, auth/session helpers, tenant helpers, and DataSentinel service wrappers
- `interfaces`, `types`, and `constants` - shared contracts, response shapes, permissions, and feature constants
- `tests` - Playwright end-to-end scenarios

The app uses a provider pattern for feature state. Data is typically fetched through helpers in `utils`, normalized through typed interfaces, then exposed to pages and feature components through the relevant provider.

## Backend Integration Modes

The frontend supports two backend integration modes.

### 1. Direct backend mode

Use this when the browser can call the backend directly.

Set:

```env
NEXT_PUBLIC_API_LINK=https://localhost:____
```

In this mode, frontend API helpers call the backend base URL directly.

### 2. Proxy mode

Use this when you want browser requests to go through the Next.js app first, such as local proxy development or some deployments.

Set:

```env
NEXT_PUBLIC_API_LINK=/api/proxy
API_BACKEND_URL=https://your-backend-url
```

In this mode:

- browser code talks to `/api/proxy`
- the Next.js route at `app/api/proxy/[...path]` forwards the request to `API_BACKEND_URL`
- auth headers and `Abp.TenantId` are forwarded by the proxy route

## Environment Variables

Copy `.env.example` to `.env.local` and set the values that match your environment.

### Required for backend communication

- `NEXT_PUBLIC_API_LINK`
  - frontend-visible base URL used by Axios helpers
  - use either a direct backend URL or `/api/proxy`

### Required only for proxy mode

- `API_BACKEND_URL`
  - backend origin used by `app/api/proxy/[...path]`
  - ignored if you use direct backend mode

### Required only for AI features

- `GROQ_API_KEY`
  - server-side key used by the local Next.js AI routes
  - if omitted, AI summary and triage routes return unavailable responses

Use your actual local or deployed hostnames and replace any `____` examples with the real port in your environment.

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Choose direct backend mode or proxy mode.
4. Start the backend first.
5. Start the frontend dev server.

From this directory:

```bash
npm install
npm run dev
```

## Development Workflow

Available scripts from [`package.json`](C:\Users\Jason\Desktop\GroupProjectBoxfusion\team-2-group-project\package.json):

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

Typical day-to-day flow:

1. Start the backend.
2. Set the correct frontend env vars.
3. Run `npm run dev`.
4. Verify login/session bootstrap against the target backend.
5. Use `npm run lint` before handoff.

## Backend API Shape Used By The Frontend

The frontend depends on the ASP.NET Core backend’s ABP-style API surface.

Key auth/session endpoints:

- `POST /api/TokenAuth/Authenticate`
- `POST /api/services/app/Account/Register`
- `POST /api/services/app/Account/IsTenantAvailable`
- `POST /api/services/app/Session/GetCurrentLoginInformations`

Key DataSentinel backend areas:

- `/api/services/app/ActivityEvent/...`
- `/api/services/app/MonitoringInfrastructure/...`
- `/api/services/app/Dashboards/...`
- `/api/services/app/AnomalyDetection/...`
- `/api/services/app/SecurityAlert/...`
- `/api/services/app/IncidentNote/...`
- `/api/services/app/IncidentReport/...`

Admin and access-management pages also depend on users, roles, and tenants endpoints exposed by the backend.

## Tenant-Aware Requests

The frontend is tenant-aware.

- tenant context is resolved from query string, hostname, session storage, and the `Abp.TenantId` cookie
- backend requests can include the `Abp.TenantId` header
- the proxy route forwards tenant context upstream
- tenant-scoped navigation is hidden when tenant context is missing

If tenant-sensitive routes behave unexpectedly, verify both the session state and the current tenant context before debugging page logic.

## Local API Routes

The frontend includes server-side Next.js routes for two purposes.

### Proxy route

`app/api/proxy/[...path]` forwards requests to the backend and preserves:

- request method and body
- authorization header
- tenant header and tenant cookie

This route is the integration point when `NEXT_PUBLIC_API_LINK=/api/proxy`.

### AI routes

These routes call Groq from the server side and return frontend-friendly summaries:

- `/api/ai/activity-summary`
- `/api/ai/dashboard-summary`
- `/api/ai/analyze-alert`
- `/api/ai/alerts-triage`

These routes depend on `GROQ_API_KEY` and are optional. The core frontend still works without them.

## Testing

Playwright is configured for frontend regression coverage under `tests`.

Current testing setup includes:

- Chromium
- Firefox
- WebKit

The Playwright config uses a production-style flow:

- builds the app
- starts the app on a local loopback host and port
- injects `NEXT_PUBLIC_API_LINK` as `/api/proxy`
- runs browser tests against that local server

Run the suite with:

```bash
npm run test:e2e
```

Use `npm run test:e2e:headed` for visible browser runs and `npm run test:e2e:ui` for the Playwright UI.

## Troubleshooting

### Backend URL mismatch

If login, session bootstrap, or feature data fails across the app, confirm that `NEXT_PUBLIC_API_LINK` points to the backend mode you intended to use.

### Proxy mode is configured incorrectly

If `NEXT_PUBLIC_API_LINK=/api/proxy` but `API_BACKEND_URL` is missing or incorrect, browser requests will reach the proxy route but fail before reaching the backend.

### `GROQ_API_KEY` is missing

If AI panels show unavailable responses, confirm `GROQ_API_KEY` is set for the Next.js server process, not just in the browser environment.
To get an API key, visit:
https://console.groq.com/keys

### Auth or session bootstrap fails

Check the backend is running, the auth endpoints are reachable, and the frontend restarted after env changes.

### Tenant context is wrong or missing

If tenant-scoped pages, permissions, or DataSentinel navigation do not appear correctly:

- check `Abp.TenantId` cookie/header behavior
- verify tenancy resolution from query string or hostname
- confirm the current tenant is available in the backend

### Environment changes are ignored

Next.js does not reliably pick up env changes in an already-running dev server. Restart `npm run dev` after editing `.env.local`.

## Contributor Notes

Use these repo-specific docs when working on frontend behavior that depends on established project conventions:

- [`AGENTS.md`]
- [`team-2-group-project/.codex/auth-multi-tenancy.md`]
- [`team-2-group-project/.codex/provider-pattern-contract.md`]
- [`team-2-group-project/.codex/review-checklist.md`]

Keep those as implementation references. This README is the contributor-facing setup and architecture guide.

## Related Docs

- Project overview: [`README.md`]
- Backend guide: [`aspnet-core/README.md`]
