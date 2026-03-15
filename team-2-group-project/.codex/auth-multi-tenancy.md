# Auth And Multi-Tenancy Notes

## Purpose

This file defines how the Next.js frontend should implement authentication, registration, tenant resolution, tenant switching, and current-session bootstrap based on the actual ABP backend scaffold and the Angular reference flow.

## Current Backend Source Of Truth

### Static Roles And Permissions

Backend role and permission source files:

- `../aspnet-core/src/Team2GroupProject.Core/Authorization/Roles/StaticRoleNames.cs`
- `../aspnet-core/src/Team2GroupProject.Core/Authorization/Roles/AppRoleConfig.cs`
- `../aspnet-core/src/Team2GroupProject.Core/Authorization/PermissionNames.cs`

Exact built-in static roles:

- `Host.Admin`
- `Tenants.Admin`

There is no separate built-in `Manager` static role in the current Angular and ABP scaffold.
If exact Angular parity is the goal, do not invent one in the docs or implementation.

Relevant permissions:

- `Pages.Users`
- `Pages.Users.Activation`
- `Pages.Roles`
- `Pages.Tenants`

### Authentication

- Endpoint: `POST /api/TokenAuth/Authenticate`
- Backend file: `../aspnet-core/src/Team2GroupProject.Web.Core/Controllers/TokenAuthController.cs`

Request shape:

```ts
interface IAuthenticateRequest {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient: boolean;
}
```

Response shape:

```ts
interface IAuthenticateResponse {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  userId: number;
}
```

### Registration

- Endpoint: `POST /api/services/app/Account/Register`
- Backend file: `../aspnet-core/src/Team2GroupProject.Application/Authorization/Accounts/AccountAppService.cs`

Request shape:

```ts
interface IRegisterRequest {
  name: string;
  surname: string;
  userName: string;
  emailAddress: string;
  password: string;
}
```

Response shape:

```ts
interface IRegisterResponse {
  canLogin: boolean;
}
```

### Tenant Availability

- Endpoint: `POST /api/services/app/Account/IsTenantAvailable`
- Backend file: `../aspnet-core/src/Team2GroupProject.Application/Authorization/Accounts/AccountAppService.cs`

Request shape:

```ts
interface IIsTenantAvailableRequest {
  tenancyName: string;
}
```

Response shape:

```ts
interface IIsTenantAvailableResponse {
  state: number;
  tenantId?: number | null;
}
```

Observed backend states:

- available
- inactive
- not found

### Current Session

- Endpoint: `POST /api/services/app/Session/GetCurrentLoginInformations`
- Backend file: `../aspnet-core/src/Team2GroupProject.Application/Sessions/SessionAppService.cs`

Response shape:

```ts
interface ICurrentLoginInformations {
  application: {
    version: string;
    releaseDate: string;
    features: Record<string, boolean>;
  };
  user?: {
    id: number;
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
  } | null;
  tenant?: {
    id: number;
    tenancyName: string;
    name: string;
  } | null;
}
```

## Angular Reference Files

Use these files to match behavior:

- `../angular/src/account/login/login.component.ts`
- `../angular/src/account/login/login.component.html`
- `../angular/src/account/register/register.component.ts`
- `../angular/src/account/register/register.component.html`
- `../angular/src/account/tenant/tenant-change.component.ts`
- `../angular/src/account/tenant/tenant-change.component.html`
- `../angular/src/account/tenant/tenant-change-dialog.component.ts`
- `../angular/src/account/tenant/tenant-change-dialog.component.html`
- `../angular/src/app-initializer.ts`
- `../angular/src/shared/auth/app-auth.service.ts`
- `../angular/src/shared/session/app-session.service.ts`
- `../angular/src/app/app-routing.module.ts`
- `../angular/src/app/layout/sidebar-menu.component.ts`
- `../angular/src/app/home/home.component.ts`
- `../angular/src/app/users/users.component.ts`
- `../angular/src/app/roles/roles.component.ts`
- `../angular/src/app/tenants/tenants.component.ts`

Use them for:

- required form fields
- submit and pending behavior
- auto-login after registration when allowed
- tenant change behavior
- subdomain and query-string tenant resolution
- session bootstrap order
- logged-in shell routes
- permission-based visibility for users, roles, and tenants
- role parity between host admin, tenant admin, and tenant users

Do not copy Angular structure into the Next.js repo.

## Required Next.js File Responsibilities

All auth implementation must still follow the exact provider, page, and style pattern in `.codex/provider-pattern-contract.md`.
The backend-specific behavior below is layered on top of that strict structure, not instead of it.

### `app/(auth)/login/page.tsx`

This page should:

- render the login form
- use the shared auth styles from `app/(auth)/style/style.ts`
- call the auth provider action for authentication
- show pending and validation states
- expose a register link only when tenant-aware self-registration is allowed for the current context

Required login fields:

- `userNameOrEmailAddress`
- `password`
- `rememberClient`

### `app/(auth)/register/page.tsx`

This page should:

- render the register form
- use the shared auth styles from `app/(auth)/style/style.ts`
- call the auth provider action for registration
- navigate back to login when needed

Required register fields:

- `name`
- `surname`
- `emailAddress`
- `userName`
- `password`

Required post-register behavior:

- if `canLogin` is `false`, show success feedback and route back to login
- if `canLogin` is `true`, authenticate immediately using the registered username and password

### `app/(auth)/style/style.ts`

This file is the shared auth-route style hook.
Both login and register should use it for:

- page shell
- auth card/container
- shared form spacing
- shared header and footer link styling
- tenant indicator and tenant-change trigger styling

### `providers/authProvider/`

This is the first provider that must be fully implemented.

It should own:

- authenticate
- register
- getCurrentLoginInformations
- resolveTenantFromUrl
- checkTenantAvailability
- setTenantContext
- clearTenantContext
- logout

Required structure:

```text
providers/authProvider/
  actions.tsx
  context.tsx
  index.tsx
  reducer.tsx
```

Do not introduce extra structural variations for auth state management.

### `utils/auth/`

This folder should hold the actual auth integration helpers.

Suggested split:

```text
utils/auth/
  authService.ts
  tenantService.ts
  sessionService.ts
```

## Required Multi-Tenancy Behavior

### Tenant Resolution

Match the Angular initializer behavior:

1. Try to resolve tenant name from subdomain.
2. If none, try to resolve tenant name from the `abp_tenancy_name` query string.
3. If no tenant name is found, continue in host context.
4. If a tenant name is found, call `Account/IsTenantAvailable`.
5. Only persist tenant context if the tenant is available.

### Tenant Persistence

The Angular app uses the ABP tenant cookie helper and includes `Abp.TenantId` in request headers.

For Next.js, keep the same behavior centralized:

- persist tenant id in one place only
- clear it in one place only
- inject `Abp.TenantId` through `utils/axiosInstance.ts`

Do not set tenant headers manually from route components.

### Tenant Switching

The Angular flow allows the user to:

- view current tenant
- switch to another tenant by tenancy name
- clear the tenant to return to host mode

Next.js should preserve the same behavior.

Required outcomes:

- available tenant -> save tenant context, refresh app session
- inactive tenant -> show warning feedback
- missing tenant -> show warning feedback
- empty tenancy name -> clear tenant context and return to host mode

## Required Logged-In Entry Shell

To match the Angular app, the authenticated part of the app should include:

- a home entry page
- an about entry page
- users management page
- roles management page
- tenants management page
- update-password route

The Angular routing and sidebar currently expose:

- `/app/home`
- `/app/about`
- `/app/users`
- `/app/roles`
- `/app/tenants`

Use permission-based route protection for:

- users -> `Pages.Users`
- roles -> `Pages.Roles`
- tenants -> `Pages.Tenants`

Authenticated users without those permissions should still be able to reach the basic logged-in shell.

## Required Role Parity

If the goal is exact Angular parity, the Next.js implementation should document and enforce this access model:

- host admin
  - static role: `Host.Admin`
  - manages tenants, users, and roles
- tenant admin
  - static role: `Tenants.Admin`
  - manages users and roles inside the active tenant
  - does not manage the global tenants list
- tenant user
  - standard authenticated tenant user
  - can access the logged-in shell
  - only sees management sections when granted the corresponding permissions

Do not describe or implement a separate built-in `Manager` static role as if it already exists in Angular or ABP.

## Required Auth Flow Order

### On App Startup

1. Resolve tenant context.
2. Initialize shared configuration.
3. If a token exists, fetch current login information.

### On Login

1. Ensure tenant context is already resolved if tenant mode is being used.
2. Call `TokenAuth/Authenticate`.
3. Persist the token centrally.
4. Fetch current login information.
5. Navigate to the post-auth route.

### On Register

1. Submit the register DTO.
2. If `canLogin` is false, send the user to login with success feedback.
3. If `canLogin` is true, authenticate immediately.
4. Fetch current login information.

## Implementation Guardrails

- Keep tenant logic out of random UI components.
- Keep token logic out of random UI components.
- Keep session bootstrap centralized.
- Keep the provider, page, and style structure identical to `.codex/provider-pattern-contract.md`.
- Use Angular as a behavior reference only.
- Match the existing Angular and ABP role/permission model before inventing new role concepts.
