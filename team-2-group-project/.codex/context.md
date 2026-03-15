# Frontend Context

## Purpose

This file captures the actual current frontend state and the required direction for `team-2-group-project`.

## Actual Current State (March 15, 2026)

- The Next.js app now has a real auth route group scaffold:
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/register/page.tsx`
  - `app/(auth)/style/style.ts`
  - `app/(auth)/loading.tsx`
- The root app also has:
  - `app/page.tsx`
  - `app/style/style.ts`
  - `app/providers.tsx`
- Ant Design, `antd-style`, `axios`, `redux-actions`, and `@types/redux-actions` are already declared in `package.json`.
- `app/providers.tsx` currently wraps the app in `ConfigProvider`.
- `providers/authProvider/` exists, but the actual auth provider implementation is still pending.
- `utils/axiosInstance.ts` still contains a placeholder and must be replaced before real API integration.
- `components/auth/` and `components/spinner/` exist, but the auth UI components still need implementation.

## Current Repo Shape

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
  session/
  todos/
  axiosInstance.ts
  helpers.ts
  roles.ts
  themeSetup.ts
```

## Backend Context

Only the ABP auth and multi-tenancy scaffold should currently be treated as the confirmed backend integration surface for the Next.js app:

- `TokenAuthController.Authenticate`
- `AccountAppService.Register`
- `AccountAppService.IsTenantAvailable`
- `SessionAppService.GetCurrentLoginInformations`

This means the frontend should prioritize:

- login
- register
- tenant resolution and tenant switching
- current-session bootstrap

## Angular Reference Context

The Angular project is the source of truth for expected auth and tenant behavior, not for project structure.

Use these Angular files as reference when documenting or implementing behavior:

- `../angular/src/account/login/login.component.ts`
- `../angular/src/account/login/login.component.html`
- `../angular/src/account/register/register.component.ts`
- `../angular/src/account/register/register.component.html`
- `../angular/src/account/tenant/tenant-change.component.ts`
- `../angular/src/account/tenant/tenant-change-dialog.component.ts`
- `../angular/src/app-initializer.ts`
- `../angular/src/shared/auth/app-auth.service.ts`
- `../angular/src/shared/session/app-session.service.ts`

## Source Of Truth Order

1. Actual repo state
2. `AGENTS.md`
3. `.codex/context.md`
4. `.codex/rules.md`
5. `.codex/auth-multi-tenancy.md`
6. `.codex/provider-pattern-contract.md`
7. `.codex/review-checklist.md`
8. Confirmed backend contracts in `../aspnet-core`
9. Angular auth and tenant reference flows in `../angular`

## Required Direction

- Keep the App Router.
- Build auth first.
- Use provider modules for shared feature state, starting with `authProvider`.
- Keep page components orchestration-only.
- Keep API contracts typed and centralized.
- Keep tenant resolution and tenant header logic centralized.
- Use Ant Design and `antd-style`.
- Do not document or build business features as if the backend already exposes them when only auth scaffolding is confirmed.
