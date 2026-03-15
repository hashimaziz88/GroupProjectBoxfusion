# Frontend Review Checklist

## Contract Compliance

- [ ] Provider modules use `actions.tsx`, `context.tsx`, `index.tsx`, and `reducer.tsx`.
- [ ] Provider modules match the exact structure and flow in `.codex/provider-pattern-contract.md`.
- [ ] Provider flow follows pending -> success/error transitions.
- [ ] Implementation follows `.codex/provider-pattern-contract.md`.
- [ ] Auth implementation follows `.codex/auth-multi-tenancy.md`.

## API Integration

- [ ] All API calls go through `axiosInstance()`.
- [ ] Base URL comes from `NEXT_PUBLIC_API_LINK`.
- [ ] Token handling is centralized.
- [ ] Tenant handling is centralized.
- [ ] `Abp.TenantId` is injected centrally instead of per component.
- [ ] Endpoint wrappers live in `utils/<feature>/`.

## Architecture

- [ ] Route files are orchestration-only.
- [ ] Routable folders expose a `page.tsx`.
- [ ] Pages follow the exact content-component plus provider-wrapper pattern from `.codex/provider-pattern-contract.md`.
- [ ] Shared page-level styles live in a `style.ts` pattern instead of large inline objects.
- [ ] Shared UI is in `components/`.
- [ ] Shared types are centralized and explicit.
- [ ] No duplicated logic across pages or features.

## Auth And Multi-Tenancy

- [ ] Login page uses `userNameOrEmailAddress`, `password`, and `rememberClient`.
- [ ] Register page uses `name`, `surname`, `emailAddress`, `userName`, and `password`.
- [ ] Register flow handles `canLogin` correctly.
- [ ] Tenant availability is checked before tenant context is persisted.
- [ ] Clearing tenant context switches back to host mode.
- [ ] Current login information is refreshed after login and tenant changes.
- [ ] Tenant resolution strategy matches the documented Angular reference behavior.

## UX And State

- [ ] Loading states are visible.
- [ ] Error states are clear and normalized.
- [ ] Empty-state behavior is handled where relevant.
- [ ] Auth-guarded routes are protected.
- [ ] Tenant-change feedback is clear when a tenant is missing or inactive.

## Style

- [ ] Ant Design components are used consistently.
- [ ] `antd-style` is used with the `createStyles` plus `css` pattern from `.codex/provider-pattern-contract.md`.
- [ ] No inline styling is used anywhere in feature pages or shared components.

## Reject If Any Are True

- [ ] API calls are mixed directly into large JSX route files.
- [ ] Provider structure is inconsistent between features.
- [ ] Provider, page, or style files structurally deviate from the strict contract.
- [ ] Inline styling is used anywhere instead of the required style files.
- [ ] More than one Axios creation pattern exists.
- [ ] New feature work ignores repo docs or provider contract.
- [ ] The implementation assumes business-feature backend endpoints that are not yet confirmed.
- [ ] The implementation still contains naming copied from unrelated projects.
