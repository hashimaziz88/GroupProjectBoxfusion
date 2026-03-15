# AGENTS.md

## Purpose

This file defines the repo-local working contract for `team-2-group-project`.
Use it with the files under `.codex/` before adding or reviewing frontend code.

## Source Of Truth Order

1. Actual repo state
2. This `AGENTS.md`
3. `.codex/context.md`
4. `.codex/rules.md`
5. `.codex/auth-multi-tenancy.md`
6. `.codex/provider-pattern-contract.md`
7. `.codex/review-checklist.md`
8. Confirmed backend contracts in `../aspnet-core`
9. Angular auth and tenant reference flows in `../angular`

## Current Direction

- The Next.js repo is now an auth-first frontend scaffold.
- The only confirmed backend surface currently available for frontend integration is the ABP authentication, registration, session, and multi-tenancy scaffold.
- Login, register, tenant resolution, and current-session bootstrap must follow the ASP.NET Core contracts and the Angular reference flow.
- Use the Next.js App Router only.
- Create all new implementation files in TypeScript.
- Keep one shared Axios factory only at `utils/axiosInstance.ts`.
- Put shared feature state inside provider modules that follow the exact 4-file contract from `.codex/provider-pattern-contract.md`.
- Keep route pages orchestration-only.
- Keep request and response contracts explicit and centralized.
- Use Ant Design and `antd-style`.
- Do not copy unrelated project wording or structures into this repo.

## Required Files And Folders

- `.codex/context.md`
- `.codex/rules.md`
- `.codex/auth-multi-tenancy.md`
- `.codex/provider-pattern-contract.md`
- `.codex/review-checklist.md`
- `.env.example`
- `app/`
- `components/`
- `constants/`
- `hoc/`
- `providers/`
- `types/`
- `utils/`

## Current App Router Shape

Follow the current repo shape unless the docs are updated with a new source of truth:

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
```

## `page.tsx` Format

- `page.tsx` files are orchestration-only.
- They must follow the page/provider composition pattern from `.codex/provider-pattern-contract.md`.
- They compose providers, route-level layout, presentational components, and provider actions.
- They do not define raw endpoint URLs or large business workflows.
- `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` should stay focused on the auth flow described in `.codex/auth-multi-tenancy.md`.

## `style.ts` Format

- Root shared page styles belong in `app/style/style.ts`.
- Shared auth-route styles belong in `app/(auth)/style/style.ts`.
- Use `antd-style` and export `useStyles`.
- Use the `createStyles` plus `css` pattern documented in `.codex/provider-pattern-contract.md`.
- Keep layout wrappers, spacing, visual surfaces, and repeated typography rules there so `page.tsx` stays focused on composition.
- Inline styling should never be used.

## Auth And Multi-Tenancy Rules

- Build the first real provider in `providers/authProvider/`.
- The auth provider must use the exact `actions.tsx`, `context.tsx`, `index.tsx`, and `reducer.tsx` structure documented in `.codex/provider-pattern-contract.md`.
- Build auth endpoint wrappers under `utils/auth/`.
- Resolve tenant context before authentication when a tenant name is present.
- Centralize tenant persistence and `Abp.TenantId` header usage.
- Bootstrap the current session after login and after tenant changes.
- Use the Angular account flow as a behavior reference, not as a structure to copy verbatim.
- No structural deviations from the provider, page, and style contract are allowed.
- Match the Angular and ABP role model exactly:
  - `Host.Admin`
  - `Tenants.Admin`
  - tenant users with permission-based access
- Do not invent a separate built-in `Manager` role if the goal is exact Angular parity.

## Setup Notes

- Copy `.env.example` to `.env.local`.
- Set `NEXT_PUBLIC_API_LINK` to the ASP.NET Core host base URL.
- Run `npm install` to restore the dependencies already declared in `package.json`.
- Replace the placeholder in `utils/axiosInstance.ts` before implementing real API integration.
