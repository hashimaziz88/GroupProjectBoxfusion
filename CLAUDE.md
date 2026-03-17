# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a monorepo with two workspaces:

- `aspnet-core/` — ASP.NET Core 8 / ABP Framework 9 backend (REST API + PostgreSQL)
- `team-2-group-project/` — Next.js 16 frontend (App Router)

---

## Backend (`aspnet-core/`)

### Commands

```bash
# From aspnet-core/
dotnet build Team2GroupProject.sln
dotnet run --project src/Team2GroupProject.Web.Host

# Run all tests
dotnet test test/Team2GroupProject.Tests

# Run a single test class
dotnet test test/Team2GroupProject.Tests --filter "FullyQualifiedName~MonitoringInfrastructureEntity_Tests"

# Apply EF Core migrations
dotnet run --project src/Team2GroupProject.Migrator
```

### Architecture

**Layer structure (ABP):**

| Project | Role |
|---|---|
| `Team2GroupProject.Core` | Domain entities, domain services, constants |
| `Team2GroupProject.Application` | App services, DTOs, authorization |
| `Team2GroupProject.EntityFrameworkCore` | EF Core DbContext, migrations, EF configurations |
| `Team2GroupProject.Web.Core` | Controllers base, token auth controller |
| `Team2GroupProject.Web.Host` | ASP.NET Core host, Startup, appsettings |
| `Team2GroupProject.Migrator` | Standalone migration runner (console app) |
| `Team2GroupProject.Tests` | xUnit integration tests |

**Database:** PostgreSQL (Npgsql). Connection string lives in `aspnet-core/src/Team2GroupProject.Web.Host/appsettings.json`.

**DbContext:** `Team2GroupProjectDbContext` extends `AbpZeroDbContext<Tenant, Role, User, ...>`. Domain entities are registered here with explicit `IEntityTypeConfiguration` classes under `EntityFrameworkCore/<feature>/Configurations/`.

**Domain entities** inherit from ABP base classes:
- `FullAuditedEntity<Guid>` for soft-delete + full audit trail
- `IMustHaveTenant` to enforce tenant isolation

**Current domain feature:** `DataSentinel` — monitoring infrastructure (`MonitoredServer` → `MonitoredDatabase` → `MonitoredTable` hierarchy, all tenant-scoped).

**Auth:** JWT bearer via ABP's `TokenAuthController` (`POST /api/TokenAuth/Authenticate`). Multi-tenancy is handled by ABP Zero — `Abp.TenantId` header selects the active tenant.

**Key backend API surface:**
- `POST /api/TokenAuth/Authenticate`
- `POST /api/services/app/Account/Register`
- `POST /api/services/app/Account/IsTenantAvailable`
- `POST /api/services/app/Session/GetCurrentLoginInformations`
- Users/Roles/Tenants management (permission-gated under `Pages.Users`, `Pages.Roles`, `Pages.Tenants`)

**ABP role model:**
- `Host.Admin` — host-level superadmin
- `Tenants.Admin` — tenant-level admin
- Regular tenant users with permission-based access

---

## Frontend (`team-2-group-project/`)

### Commands

```bash
# From team-2-group-project/
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_LINK to the backend base URL
npm run dev
npm run build
npm run lint
```

No frontend test runner is configured yet.

### Architecture

**Stack:** Next.js 16 (App Router only), React 19, TypeScript 5 strict, Ant Design 6, antd-style (CSS-in-JS), Axios, redux-actions + useReducer.

**Enforced patterns — no deviations allowed:**

#### Provider pattern (4-file structure)
Every feature's shared state lives in `providers/<feature>Provider/` with exactly:
```
actions.tsx    # createAction calls; enum keys follow pending/success/error
context.tsx    # interfaces, INITIAL_STATE, React contexts
index.tsx      # Provider component + useXxxState / useXxxActions hooks
reducer.tsx    # handleActions reducer
```
Async actions always dispatch: `pending → success | error`.

#### API layer
- Single Axios factory at `utils/axiosInstance.ts` — injects `Authorization` and `Abp.TenantId` headers automatically.
- Never import `axios` directly in components or pages.
- Feature endpoint wrappers live in `utils/<feature>/` (e.g., `utils/auth/authService.ts`).
- All ABP responses follow `{ success, result, error }` — use `unwrapAbpResponse()` from `utils/abp.ts`.

#### Page rules
- `app/page.tsx` — root redirect only (auth state check).
- `app/(auth)/` — unauthenticated routes (login, register).
- All other routes protected by `withAuth` HOC (`hoc/withAuth.tsx`).
- Pages are **orchestration-only**: no API calls, no business logic, no inline styles.

```tsx
export default withAuth(Page);                    // auth required
export default withAuth(Page, PERMISSIONS.users); // auth + permission required
```

#### Styling
All styles use `antd-style`'s `createStyles`. Style files are named `style.ts` and co-located under `app/<route>/style/style.ts`. Never use inline styles or plain CSS modules.

#### Path alias
Use `@/` to import from the project root.

### Auth & Multi-Tenancy Flow

Runs on mount inside `providers/authProvider/`:
1. Resolve tenant from URL subdomain or `?abp_tenancy_name` query string.
2. Call `getUserConfiguration()` for permissions.
3. If token exists, call `getMe()` for session info.

Token is stored in sessionStorage (default) or localStorage (remember me) + encrypted cookie. Tenant ID stored in sessionStorage + cookie `Abp.TenantId`. Both are injected automatically by the Axios factory.

### Binding Contracts

The `.codex/` directory in `team-2-group-project/` is authoritative:
- `.codex/rules.md` — non-negotiable rules and forbidden patterns
- `.codex/auth-multi-tenancy.md` — backend endpoint shapes and exact auth flow order
- `.codex/provider-pattern-contract.md` — provider structure with code examples
- `.codex/review-checklist.md` — pre-handoff checklist

**Forbidden patterns:**
- Multiple Axios instances
- API calls inside JSX or page components
- Inline styles or non-antd-style CSS
- Provider files outside the 4-file structure
- Mixing state management patterns
