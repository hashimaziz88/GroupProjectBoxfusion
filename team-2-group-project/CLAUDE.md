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

- **Next.js 16** (App Router only — no Pages Router)
- **React 19** + **TypeScript 5** (strict mode)
- **Ant Design 6** + **antd-style** (CSS-in-JS — all styles in `style.ts` files, never inline)
- **Axios** (single factory, never create additional instances)
- **React Context + redux-actions + useReducer** (state management pattern)
- **Backend:** ASP.NET Core with ABP framework (multi-tenant)

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

Feature wrappers in `utils/auth/`:
- `authService.ts` — `authenticate()`, `register()`, token management
- `tenantService.ts` — `isTenantAvailable()`, tenant persistence
- `sessionService.ts` — `getCurrentLoginInformations()`, `getUserConfiguration()`
- `adminService.ts` — users, roles, tenants, change password

All responses follow ABP's `{ success, result, error }` shape — use `unwrapAbpResponse()` from `utils/abp.ts`.

### Routing & Page Rules

- `app/page.tsx` — root redirect based on auth state
- `app/(auth)/` — unauthenticated routes (login, register)
- All other routes — protected by `withAuth` HOC (in `hoc/withAuth.tsx`)

**Pages are orchestration-only** — no API calls, business logic, or inline styles in page files. Pages compose providers and components.

Route protection:
```tsx
export default withAuth(Page);                         // Auth required
export default withAuth(Page, PERMISSIONS.users);      // Auth + permission required
```

### Styling

All styles use `antd-style`'s `createStyles`:
```tsx
// In app/feature/style/style.ts
import { createStyles, css } from "antd-style";
export const useStyles = createStyles(({ token }) => ({ ... }));
```

Never use inline styles or plain CSS modules.

### Path Alias

Use `@/` to import from the project root:
```ts
import { axiosInstance } from "@/utils/axiosInstance";
```

## Key Contracts

The `.codex/` directory contains binding contracts:
- `.codex/rules.md` — non-negotiable rules and forbidden patterns
- `.codex/auth-multi-tenancy.md` — backend endpoint shapes and auth flow order
- `.codex/provider-pattern-contract.md` — exact provider structure with examples
- `.codex/review-checklist.md` — pre-handoff checklist (74 items)

**Forbidden patterns** (from `.codex/rules.md`):
- Multiple Axios instances or factories
- API calls inside JSX or page components
- Inline styles or non-antd-style CSS
- Provider files outside the 4-file structure
- Mixing state management patterns
