# Team 2 Group Project Frontend

This repository is the Next.js frontend workspace for `team-2-group-project`.
It is currently an auth-first scaffold aligned to the ABP backend authentication and multi-tenancy surface that already exists in `../aspnet-core`.

## Source Of Truth

1. Actual repo state
2. `AGENTS.md`
3. `.codex/context.md`
4. `.codex/rules.md`
5. `.codex/auth-multi-tenancy.md`
6. `.codex/provider-pattern-contract.md`
7. `.codex/review-checklist.md`
8. Confirmed backend contracts in `../aspnet-core`
9. Angular auth and tenant reference flows in `../angular`

## Current Frontend Shape

```text
app/
  (auth)/
    login/
      page.tsx
    register/
      page.tsx
    style/
      style.ts
    loading.tsx
  style/
    style.ts
  favicon.ico
  globals.css
  layout.tsx
  loading.tsx
  page.tsx
  providers.tsx
components/
  auth/
  spinner/
constants/
hoc/
  withAuth.tsx
providers/
  authProvider/
types/
utils/
  auth/
  dashboard/
  session/
  todos/
  axiosInstance.ts
  helpers.ts
  roles.ts
  themeSetup.ts
```

## Current Backend Surface

The frontend should currently treat these ASP.NET Core contracts as the active auth source of truth:

- `POST /api/TokenAuth/Authenticate`
- `POST /api/services/app/Account/Register`
- `POST /api/services/app/Account/IsTenantAvailable`
- `POST /api/services/app/Session/GetCurrentLoginInformations`
- users management under `Pages.Users`
- roles management under `Pages.Roles`
- tenant management under `Pages.Tenants`

These are documented in `.codex/auth-multi-tenancy.md`.

## Exact Angular Parity Notes

If the goal is to match the Angular app exactly, the authenticated Next.js app should preserve:

- auth routes for login, register, and tenant switching
- an authenticated shell with home/about-style entry pages
- permission-gated users, roles, and tenants pages
- the ABP static role model:
  - `Host.Admin`
  - `Tenants.Admin`
  - regular tenant users

There is no built-in separate `Manager` static role in the current Angular and ABP scaffold.

## Angular Reference Use

Use the Angular project only to document expected auth behavior and tenant flow:

- `../angular/src/account/login`
- `../angular/src/account/register`
- `../angular/src/account/tenant`
- `../angular/src/app-initializer.ts`
- `../angular/src/shared/auth/app-auth.service.ts`
- `../angular/src/shared/session/app-session.service.ts`

Do not copy Angular structure into this repo. Recreate the flow using the Next.js conventions documented here.

## Setup

1. Copy `.env.example` to `.env.local`.
2. For local development, point `NEXT_PUBLIC_API_LINK` at the ABP host base URL. In this repo that is typically `https://localhost:44311`.
3. Restart the Next.js dev server after changing env files so tenant-aware auth and session bootstrap use the updated backend.
4. Run:

```bash
npm install
npm run dev
```

## Team Guidance

- Read `AGENTS.md` before adding feature files.
- Read `.codex/auth-multi-tenancy.md` before implementing login, register, tenant selection, or session bootstrap.
- Use `.codex/provider-pattern-contract.md` when building `providers/authProvider`.
- Use `.codex/review-checklist.md` before handoff.
