# Frontend Rules

## Core Rule

Implement the current frontend around the confirmed auth and multi-tenancy surface first, using the same provider, utility, and typed-contract flow everywhere.

## Non-Negotiable Rules

1. App Router only.
2. TypeScript for all new feature files.
3. One Axios factory only at `utils/axiosInstance.ts`.
4. Shared feature state must use the 4-file provider module structure.
5. `redux-actions` action creators and `handleActions` reducer flow are required for provider modules.
6. Route page files are orchestration-only.
7. Endpoint wrappers live in `utils/<feature>/`.
8. Shared types live in `types/` or in provider `context.tsx` when strictly feature-local.
9. Use Ant Design and `antd-style`.
10. Never use inline styles or `style` props for anything. All styles must be in `style.ts` files with `createStyles` and `css` from `antd-style`.
11. Do not deviate from `.codex/provider-pattern-contract.md`.

## Current Auth-First Rule

- `providers/authProvider/` is the first provider module that should be fully implemented.
- `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` should be built from `.codex/auth-multi-tenancy.md`.
- `app/(auth)/style/style.ts` is the shared style file for auth routes.
- `app/style/style.ts` is the shared style file for the root app route.
- The provider, page, and style implementation style must match `.codex/provider-pattern-contract.md` exactly.

## Required Provider File Layout

```text
providers/<feature>Provider/
  actions.tsx
  context.tsx
  index.tsx
  reducer.tsx
```

## Async Flow Rule

Each async action sequence must follow:

1. Dispatch pending.
2. Call a utility wrapper or `axiosInstance()`.
3. Dispatch success on response.
4. Dispatch error on failure.

## API Rule

- Do not call endpoints directly from random pages or components.
- Always call through utility wrappers or provider methods using `axiosInstance()`.
- Do not create per-feature Axios clients.
- Centralize token handling.
- Centralize tenant handling.
- Include `Abp.TenantId` only through centralized request code when a tenant context exists.

## Route Folder Rule

- Each routable folder must keep `page.tsx` as the entry file.
- `page.tsx` is responsible for composition only: provider wrapper, route shell, presentational components, and effect kickoff through provider actions.
- Follow the exact content-component plus provider-wrapper export pattern from `.codex/provider-pattern-contract.md`.
- Shared app loading UIs belong in `app/loading.tsx` or route-group `loading.tsx`.
- Shared page style hooks belong in `app/style/style.ts` or route-group `style/style.ts`.

## `style.ts` Rule

- Use `antd-style` and export `useStyles`.
- Use the `createStyles` and `css` pattern from `.codex/provider-pattern-contract.md`.
- Keep layout containers, spacing, visual surfaces, and repeated typography rules in `style.ts`.
- Inline styling should never be used.

## Auth And Multi-Tenancy Rule

- Resolve tenant context before login when a tenant name is present.
- Support the Angular reference strategies:
  - subdomain tenancy resolution
  - `abp_tenancy_name` query-string resolution
- Use tenant availability checks before persisting tenant context.
- Clearing the tenant should switch the app back to host context.
- Refresh current login information after authentication and after tenant changes.

## Forbidden Patterns

- Mixing API calls, DTO types, and large JSX in one file
- Per-feature custom Axios creation
- Provider modules that skip one of the required files
- Provider modules that change the exact file naming or flow from `.codex/provider-pattern-contract.md`
- Route pages with business logic and manual endpoint construction
- Any inline styling
- Route folders without a `page.tsx` entry file when they are meant to be navigable
- Building business-feature docs as if they are already supported by the backend when only auth scaffolding is confirmed
- Copying Angular code structure into the Next.js repo instead of translating the behavior into Next.js patterns

## Review Question

Would this file look consistent with the auth/multi-tenancy contract, provider contract, and current repo docs?
If no, revise it.
