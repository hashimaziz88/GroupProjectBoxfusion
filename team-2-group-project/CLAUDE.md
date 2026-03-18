# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

Environment: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_LINK` to the backend URL.

## Tech Stack

- **Next.js 16** (App Router only — no Pages Router), React 19 compiler enabled
- **React 19** + **TypeScript 5** (strict mode)
- **Ant Design 6** + **antd-style** (CSS-in-JS — all styles in `style.ts` files, never inline)
- **Axios** (single factory, never create additional instances)
- **React Context + redux-actions + useReducer** (state management pattern)
- **Backend:** ASP.NET Core with ABP framework (multi-tenant); full API schema in `.codex/swagger.json`

## Architecture

### Provider Pattern (enforced — no deviations)

All providers live in `providers/<feature>Provider/` with exactly 4 files:

```
providers/<feature>Provider/
  actions.tsx    # createAction calls using enums
  context.tsx    # Interfaces, INITIAL_STATE, React contexts
  index.tsx      # Provider component + useXxxState / useXxxActions hooks
  reducer.tsx    # handleActions reducer
```

Actions always follow the pending → success → error pattern:
```ts
enum FeatureActionEnums { actionPending, actionSuccess, actionError }
```

Existing providers: `authProvider`, `adminProvider`, `monitoringInfrastructureProvider`, `activityMonitoringProvider`.

### Auth & Multi-Tenancy

The auth flow (in `providers/authProvider/`) initializes on mount:
1. Resolve tenant from URL subdomain or `?abp_tenancy_name` query string
2. Call `getUserConfiguration()` for permissions
3. If token exists, call `getMe()` for session info

Token stored in sessionStorage (default) or localStorage (remember me) + encrypted cookie.
Tenant ID stored in sessionStorage + cookie `Abp.TenantId`.
Both are automatically injected by the Axios factory — never set them manually in components.

### API Layer

**Single Axios factory:** `utils/axiosInstance.ts` — creates an instance per-call with `Authorization` and `Abp.TenantId` headers. Never import axios directly in components or pages.

Feature wrappers:
- `utils/auth/authService.ts` — `authenticate()`, `register()`, token management
- `utils/auth/tenantService.ts` — `isTenantAvailable()`, tenant persistence, subdomain resolution
- `utils/auth/sessionService.ts` — `getCurrentLoginInformations()`, `getUserConfiguration()`
- `utils/auth/adminService.ts` — users, roles, tenants, change password
- `utils/datasentinel/monitoringService.ts` — monitoring infrastructure CRUD (servers, databases, tables)
- `utils/datasentinel/activityService.ts` — activity monitoring endpoints
- `utils/datasentinel/intakeService.ts` — intake endpoints

All responses follow ABP's `{ success, result, error }` shape — use `unwrapAbpResponse()` from `utils/abp.ts`.

### Routing & Page Rules

- `app/page.tsx` — root redirect based on auth state
- `app/(auth)/` — unauthenticated routes (login, register)
- `app/datasentinel/` — DataSentinel domain routes (activity, infrastructure, intake)
- All other routes — protected by `withAuth` HOC (`hoc/withAuth.tsx`)

**Pages are orchestration-only** — no API calls, business logic, or inline styles in page files. Pages compose providers and components.

Route protection:
```tsx
export default withAuth(Page);                         // Auth required
export default withAuth(Page, PERMISSIONS.users);      // Auth + permission required
```

Permission constants live in `constants/` and are referenced as `PERMISSIONS.<key>`. Role helpers (`isHostAdmin`, `isTenantAdmin`, `hasPermission`, `selectBestAuthenticatedRoute`) live in `utils/auth/roles.ts`.

### Component Conventions

Authenticated pages wrap content in `<AppShell title="..." subtitle="...">` from `components/auth/AppShell`. The loading state uses `<AppSpinner label="..." />` from `components/spinner/AppSpinner`.

### Styling

All styles use `antd-style`'s `createStyles`, co-located at `app/<route>/style/style.ts`:
```tsx
import { createStyles } from "antd-style";
export const useStyles = createStyles(({ token }) => ({ ... }));
```

Never use inline styles or plain CSS modules.

### Path Alias

Use `@/` to import from the project root:
```ts
import { axiosInstance } from "@/utils/axiosInstance";
```

## Key Contracts

Read `.codex/` in this order for full context: `context.md` → `rules.md` → `auth-multi-tenancy.md` → `provider-pattern-contract.md` → `review-checklist.md`.

- `.codex/rules.md` — non-negotiable rules and forbidden patterns
- `.codex/auth-multi-tenancy.md` — backend endpoint shapes and auth flow order
- `.codex/provider-pattern-contract.md` — exact provider structure with code examples
- `.codex/review-checklist.md` — 74-item pre-merge checklist
- `.codex/swagger.json` — authoritative backend API schema

**Forbidden patterns** (from `.codex/rules.md`):
- Multiple Axios instances or factories
- API calls inside JSX or page components
- Inline styles or non-antd-style CSS
- Provider files outside the 4-file structure
- Mixing state management patterns
