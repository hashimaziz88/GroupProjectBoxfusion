# PROMPTKING

Absolutely — here’s a **redone Codex prompt set** that is aligned to your **actual GitHub issues**, your **existing repo reality**, and the fact that you want:

1. **one master overall prompt**, and
2. **one focused prompt per issue** so Codex can work issue-by-issue without drifting.

---

# Master Codex Prompt for the Whole DataSentinel Repo

Paste this as the **main master prompt** into Codex before working through the issues.

```text
You are working inside the existing repository for our Boxfusion graduate group project.

# Project Context

We are implementing:

**DataSentinel: SQL Security and Anomaly Monitoring Platform**

This is a Boxfusion graduate MVP project. The goal is to deliver a **credible, demo-ready security monitoring platform** within a short timebox.

Tech stack:
- Frontend: Next.js App Router
- Backend: ABP / ASP.NET Boilerplate
- Database: PostgreSQL with Npgsql / EF Core
- Auth: existing ABP auth, permissions, tenancy, and current repo auth/session flow
- Timebox: 4 days
- Team size: 4 developers

This repository already contains:
- a multi-tenant ABP / ASP.NET Boilerplate backend
- a Next.js frontend
- PostgreSQL/Npgsql support
- tenant-aware auth and permission plumbing
- frontend/backend API integration patterns
- existing repo structure that must be reused

Do NOT redesign the project from scratch.
Do NOT invent a separate architecture if the repository already has working conventions.
Extend the current codebase cleanly and consistently.

We also have a UI design package / exported design assets available in the repo context. Use that as the visual reference where practical, but do not force an unrealistic redesign if the current frontend structure does not support it cleanly.

# Problem Statement

Organizations often fail to detect unusual database activity early enough. Suspicious login failures, privileged actions, write spikes, or anomalous reads may go unnoticed without proper observability.

DataSentinel must:
- monitor simulated database/security activity
- persist activity events
- detect anomalies using deterministic rules
- generate security alerts
- support alert review and investigation
- expose dashboards and security visualisations
- provide AI-assisted defensive explanation of suspicious incidents

# Primary Users

1. Security Analyst
- review suspicious patterns
- inspect alerts
- filter by severity/date/user/database/table
- review related event history
- add notes and triage incidents

2. DBA
- monitor usage patterns
- identify failed logins, unusual writes, privileged activity
- inspect monitored servers and databases

3. Operations Manager
- review summary metrics
- view security trends
- review severity distribution and incident trends
- export high-level incident summaries

4. Platform Administrator
- manage access/roles/permissions
- manage alert rules if included in scope
- seed and demo the environment

# Delivery Philosophy

This project is an MVP.
Prioritize:
- working features
- clean integration into the current repo
- demo-readiness
- realistic scope
- maintainable code
- explicit permissions
- deterministic anomaly detection

Do NOT overengineer.
Do NOT add unnecessary architectural layers if the repo already has suitable patterns.
Prefer polished end-to-end slices over incomplete breadth.

# Security Boundaries

This is strictly a **defensive monitoring product**.

Never add:
- exploit tooling
- offensive security workflows
- attack simulation against real systems
- dangerous guidance
- credentials or secrets in logs, AI prompts, or evidence blobs

Always sanitize or redact sensitive values where relevant.

# Current GitHub Issues To Drive Implementation

You must align your work to the existing issues below. Treat them as the source of truth for scope and work slicing.

## 2 - Domain Model and Data Layer
- #20 [backend] Implement monitoring infrastructure entities
- #21 [backend] Implement ActivityEvent entity and persistence model
- #23 [backend] Implement AlertRule entity for anomaly detection rules
- #24 [backend] Implement SecurityAlert entity and alert lifecycle
- #25 [backend] Implement alert investigation entities (notes and status history)
- #26 [backend] Implement UserRiskProfile entity for tracking risky database actors

## 3 - Simulated Activity Ingestion
- #29 [backend] Implement activity event ingestion endpoint
- #30 [backend] Implement activity event query and filtering endpoints
- #32 [frontend] Implement activity event monitoring view
- #34 [backend] Implement batch activity import support

## 4 - Rule-Based Anomaly Detection
- #37 [backend] Implement anomaly detection service
- #39 [backend] Implement threshold-based anomaly detection rules
- #41 [backend] Implement out-of-hours activity detection
- #42 [backend] Implement repeated failure detection logic
- #43 [backend] Implement alert creation and alert-event linking

## 5 - Dashboard and Security Visualisation
- #44 [backend] Implement dashboard summary metrics endpoint
- #45 [backend] Implement activity trend visualisation endpoints
- #46 [backend] Implement dashboard endpoint for alerts by severity and anomaly timeline
- #48 [backend] Implement top risky users and entities dashboard endpoint
- #49 [frontend] Implement dashboard overview page
- #50 [frontend] Implement dashboard charts for activity and alert trends
- #51 [frontend] Implement top risky users and anomaly timeline panels

## 6 - Alert Review and Investigation Workflow
- #22 [OPEN] Alerts List Page
- #27 [OPEN] Alert Filtering
- #28 [OPEN] Alert Detail Screen
- #31 [OPEN] Related Event History Drill-Down
- #33 [OPEN] Alert Status Management
- #35 [OPEN] Bulk Alert Dismiss
- #36 [OPEN] Incident Notes
- #38 [OPEN] Status History Timeline
- #40 [OPEN] Export Incident Report

## 7 - AI-Supported Incident Explanation
- #47 [OPEN] AI-Generated Alert Summary and Explanation
- #52 [OPEN] Suggested Investigation Next Step
- #53 [OPEN] Priority and Risk Explanation for High-Severity Alerts
- #54 [OPEN] Fallback Behavior When AI Is Unavailable

## No Milestone
- #8 [doc] setup agentic documentation
- #5 [deploy] Run deployed backend to do migrations

# Domain Expectations

Implement a clean DataSentinel module centered around these concepts, adapting names to current repo conventions if necessary.

Core entities:
- MonitoredServer
- MonitoredDatabase
- ActivityEvent
- AlertRule
- SecurityAlert
- IncidentNote
- AlertStatusHistory
- UserRiskProfile
- optional alert-event link entity if needed for many-to-many or explicit evidence mapping

Suggested ActivityEvent fields:
- Id
- TenantId
- ServerId
- DatabaseId
- EventTime
- EventType
- ActorUser
- ActorIp
- ObjectName
- Operation
- RowsAffected
- DurationMs
- IsOutOfHours
- Severity
- IsSuccess / FailureReason where useful
- EvidenceJson or sanitized metadata JSON

Suggested AlertRule fields:
- Id
- TenantId
- Name
- Description
- IsEnabled
- RuleType
- EventType
- WindowMinutes
- ThresholdCount
- GroupByField
- Severity

Suggested SecurityAlert fields:
- Id
- TenantId
- RuleId
- CreatedAt
- Status
- Severity
- Title
- Summary
- PrimaryActorUser
- PrimaryActorIp
- EventTimeStart
- EventTimeEnd
- RelatedEventCount
- TopEvidenceJson / normalized evidence summary

Suggested IncidentNote fields:
- Id
- TenantId
- AlertId
- CreatedAt
- CreatedByUserId
- Body
- IsInternal

Suggested AlertStatusHistory fields:
- Id
- TenantId
- AlertId
- ChangedAt
- ChangedByUserId
- FromStatus
- ToStatus
- Comment

Suggested UserRiskProfile fields:
- Id
- TenantId
- ActorUser
- ActorIp
- RiskScore
- LastEvaluatedAt
- AlertCount
- FailedLoginCount
- PrivilegedActionCount
- HighSeverityAlertCount

# Detection Expectations

Use deterministic, explainable, modular rules.

Rules should include at minimum:
- threshold-based anomaly detection
- repeated failed logins within a time window
- out-of-hours activity
- excessive write spikes
- large reads/writes when relevant
- repeated suspicious access from same actor/ip
- severity escalation if multiple indicators overlap

Keep the rule evaluator testable and isolated from HTTP/controller concerns.

# Backend Expectations

Use ABP layering correctly according to the repo:
- domain/core entities
- domain services for anomaly detection and risk scoring
- application services for APIs and orchestration
- EF Core entity mappings and migrations
- permission definitions
- seeding where needed
- DTOs and authorization attributes according to existing style

Likely service areas:
- Monitoring intake / import
- Activity event query/filtering
- Alert rules
- Alerts workflow
- Dashboards
- AI insight abstraction

# Frontend Expectations

Implement frontend work inside the current Next.js structure and reuse:
- app router conventions
- auth/session provider
- tenant-aware request utilities
- route protection patterns
- current UI library choices already present in repo
- current styling conventions
- design package direction where practical

Pages/views expected from the issue list:
- dashboard overview
- alerts list page
- alert detail page
- activity event monitoring page

UI capabilities expected:
- cards / metrics
- charts
- filters
- tables/lists
- severity badges
- status controls
- note timeline
- related event history
- loading / empty / error states

# Permissions / Roles

Implement and reuse ABP permission patterns.

Suggested permissions:
- Pages.DataSentinel.Dashboard
- Pages.DataSentinel.Intake
- Pages.DataSentinel.ActivityEvents.View
- Pages.DataSentinel.Alerts.View
- Pages.DataSentinel.Alerts.Review
- Pages.DataSentinel.Alerts.Manage
- Pages.DataSentinel.Rules.View
- Pages.DataSentinel.Rules.Manage
- Pages.DataSentinel.Reports.Export
- Pages.DataSentinel.Admin
- Pages.DataSentinel.AiInsights

Suggested roles:
- SecurityAnalyst
- DBA
- OpsManager
- Admin

Access intent:
- SecurityAnalyst: dashboard, alerts, notes, review workflow, AI insight
- DBA: dashboard, activity monitoring, alerts view
- OpsManager: dashboard, analytics, alerts view, export
- Admin: full access

Seed these roles if the repo already supports role/permission seeding.

# AI Expectations

AI support must remain defensive, explainable, and safe.

AI features should support:
- alert summary
- why flagged
- likely cause
- priority/risk explanation
- suggested next investigation steps
- fallback response when AI provider is unavailable

Requirements:
- sanitize/redact sensitive values before prompt construction
- keep provider behind an interface/abstraction
- do not hardcode secrets
- allow fallback/mock implementation for demo mode
- output structured data

Expected AI output shape:
- summary
- whyFlagged
- severityReasoning
- likelyCause
- confidence
- recommendedNextSteps
- redactionNote
- fallbackUsed

# PostgreSQL / EF Core Expectations

Implement:
- proper entity configs
- indexes that help activity event filtering and alert queue queries
- tenant-aware data isolation
- migrations
- realistic demo/seed support where already used in repo

Do not overengineer partitioning or advanced infra if not needed for MVP.

# Testing Expectations

Add meaningful tests, prioritizing backend business logic and authorization-sensitive flows.

Focus on:
- anomaly detection service
- threshold rules
- repeated failures
- out-of-hours logic
- alert creation
- note creation
- status history creation
- tenant isolation where practical
- unauthorized access to protected endpoints

Critical cases:
- repeated failed logins create an alert
- below-threshold cases do not
- out-of-hours privileged activity escalates severity
- status changes create history rows
- note creation persists correctly
- restricted endpoints reject unauthorized users
- tenant A cannot read tenant B data
- AI fallback is used when provider is unavailable

# Documentation Expectations

Support:
- issue-aligned implementation notes
- architecture overview
- module structure
- entity summary
- setup steps
- environment variables
- migration/deployment notes
- AI usage disclosure
- demo instructions
- tests/run instructions

Also support issue #8 by improving agentic documentation if that folder/file structure already exists.

# Working Rules

For every issue you work on:
1. inspect existing relevant files first
2. identify current patterns before coding
3. explain concrete repo-specific plan
4. implement the change
5. keep code aligned with existing repo conventions
6. show exact files changed
7. suggest a branch name tied to the issue
8. suggest at least 3 meaningful commit messages
9. note assumptions, blockers, and follow-up issues

Do not stay high level.
Reference actual files from the repository.
Prefer small coherent issue-focused changes over giant unrelated edits.

# Issue Handling Mode

When I ask you to work on a specific issue:
- treat that GitHub issue as the implementation target
- inspect the repo first
- identify dependencies on previous issues
- implement only what is appropriate for that issue, plus minimal required supporting code
- avoid swallowing multiple unrelated issues unless necessary
- if the issue depends on incomplete earlier work, say so clearly and implement the best safe slice possible

# Definition of Done Per Issue

An issue is considered complete only if appropriate to its scope:
- backend: entity/service/endpoint/permission/test as needed
- frontend: page/component/api integration/loading-error-empty states
- docs: updated if needed
- branch name proposed
- commit messages proposed
- files changed listed

# First Task

Start by:
1. inspecting the repository structure
2. locating the existing auth, tenant, permissions, DbContext, migration, frontend route, and API integration patterns
3. mapping the issue list above onto the actual repo structure
4. summarizing the recommended implementation order based on dependencies
5. then begin with the earliest unresolved dependency issue from milestone 2 unless I explicitly tell you to focus on a different issue

When responding:
- be concrete
- reference actual files
- align work to the issue numbers
- avoid generic architecture essays
- then begin making the changes
```

---

# How to Use the Issue Prompts

Use the master prompt once first.

Then for each issue, use a **focused issue prompt** like the ones below. These are written so Codex stays tied to the actual issue and your repo instead of drifting into generic scaffolding.

---

# Issue-by-Issue Codex Prompts

---

## #20 — Monitoring Infrastructure Entities

```text
Work on GitHub issue #20: [backend] Implement monitoring infrastructure entities.

Use the existing repository structure and patterns already identified from the master prompt. Inspect the current backend module structure, DbContext, entity configuration conventions, migrations setup, tenancy approach, and naming style before making changes.

Goal:
Implement the foundational monitoring infrastructure entities required by DataSentinel, specifically the infrastructure/model layer that other issues will depend on.

Expected scope:
- add MonitoredServer entity
- add MonitoredDatabase entity
- wire them into the correct DataSentinel/backend module area
- add EF Core configuration
- add DbSet registrations
- add tenant-aware fields if consistent with repo conventions
- define relationships cleanly for future ActivityEvent usage
- create/update migration if appropriate at this stage
- keep code aligned with ABP conventions already present in the repo

Requirements:
- do not implement unrelated alert or AI logic here
- do not redesign the whole backend architecture
- reuse base entity classes and tenancy conventions from the repo
- make sure the model is realistic for later event ingestion and monitoring

When responding:
1. inspect relevant existing files first
2. explain exactly what you will add and where
3. implement the code
4. list exact files changed
5. suggest a branch name for issue #20
6. suggest at least 3 commit messages
7. note assumptions/blockers/dependencies on later issues
```

---

## #21 — ActivityEvent Entity and Persistence Model

```text
Work on GitHub issue #21: [backend] Implement ActivityEvent entity and persistence model.

Inspect the current repo first, especially:
- existing DataSentinel-related files if any
- DbContext and EF Core entity patterns
- ABP tenancy/entity base classes
- enum/value object conventions
- migration patterns

Goal:
Implement the ActivityEvent entity as the core persisted monitoring record for simulated SQL/security activity.

Expected scope:
- create ActivityEvent entity
- add appropriate fields for event time, actor, IP, object, operation, rows affected, duration, severity, success/failure, evidence metadata
- add relationships to monitored server/database where appropriate
- add DbSet registration
- add EF Core config and indexes for event queries
- add migration if appropriate
- keep schema suitable for later filtering, anomaly detection, dashboards, and related event drill-down

Constraints:
- do not add ingestion endpoints yet unless strictly required
- do not implement anomaly detection in this issue
- keep evidence payload sanitized and defensively modeled
- stay aligned with existing repo naming and layering

When responding:
1. inspect relevant files first
2. explain the entity design and persistence decisions in repo terms
3. implement the changes
4. list exact files changed
5. suggest a branch name for issue #21
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #23 — AlertRule Entity

```text
Work on GitHub issue #23: [backend] Implement AlertRule entity for anomaly detection rules.

Inspect the repo first for:
- entity patterns
- enum conventions
- validation approaches
- seed data structure if present
- ABP permissions and module organization

Goal:
Implement the AlertRule entity and persistence model for deterministic anomaly detection rules.

Expected scope:
- create AlertRule entity
- support rule name, description, enabled flag, rule type, event type, window minutes, threshold count, group by field, severity
- add supporting enums if needed
- register DbSet/configuration/migration
- shape the entity for later use by anomaly detection services and rule management UI
- keep the design modular, simple, and explainable

Do not:
- implement the anomaly detection engine itself here
- build the full CRUD UI here
- overengineer a rule DSL

When responding:
1. inspect repo files first
2. explain the rule model and why it fits the current repo
3. implement the changes
4. list exact files changed
5. suggest branch name for #23
6. provide at least 3 commit messages
7. note assumptions and next dependent issues
```

---

## #24 — SecurityAlert Entity and Alert Lifecycle

```text
Work on GitHub issue #24: [backend] Implement SecurityAlert entity and alert lifecycle.

Inspect current repo patterns first, especially:
- domain entities
- status enums
- audit fields / tenancy
- any existing workflow/lifecycle conventions
- EF mappings and migrations

Goal:
Implement the SecurityAlert domain entity as the core alert record generated by anomaly detection.

Expected scope:
- create SecurityAlert entity
- model status, severity, title, summary, actor, time range, related event count, evidence summary
- add lifecycle-oriented fields needed for later review workflow
- add alert status enum(s) if needed
- add persistence config, DbSet, and migration
- structure it so issue #33, #38, #43, and AI issues can build on it cleanly

Do not:
- implement full notes/history APIs yet
- implement AI yet
- build frontend yet

When responding:
1. inspect relevant repo files first
2. explain the alert entity design and lifecycle assumptions
3. implement changes
4. list exact files changed
5. suggest branch name for #24
6. suggest at least 3 commits
7. note dependencies and blockers
```

---

## #25 — Investigation Entities: Notes and Status History

```text
Work on GitHub issue #25: [backend] Implement alert investigation entities (notes and status history).

Inspect the repo first for:
- entity patterns
- user/audit fields
- tenancy handling
- existing note/comment/history conventions if any

Goal:
Implement the persistence model for alert investigation support.

Expected scope:
- create IncidentNote entity
- create AlertStatusHistory entity
- add relationships to SecurityAlert
- model created by / created at / comment/body / internal flag / status transitions
- add DbSet/configuration/migration
- ensure compatibility with later workflow issues #33, #36, #38

Do not:
- implement full application services yet unless minimal scaffolding is needed
- build UI yet

When responding:
1. inspect current files first
2. explain the modeling choices
3. implement the code
4. list exact files changed
5. suggest branch name for #25
6. suggest at least 3 commit messages
7. note assumptions and later issue dependencies
```

---

## #26 — UserRiskProfile Entity

```text
Work on GitHub issue #26: [backend] Implement UserRiskProfile entity for tracking risky database actors.

Inspect the repo first and identify:
- DataSentinel entity placement
- numeric scoring conventions if any
- tenancy and indexing patterns

Goal:
Implement a UserRiskProfile entity to support dashboard analytics and prioritization of risky actors.

Expected scope:
- create UserRiskProfile entity
- track actor user, actor IP where appropriate, risk score, counts/statistics, last evaluated timestamp
- persist in EF Core with appropriate indexes
- wire into DbContext/migration
- shape it for later dashboard issue #48 and AI prioritization issue #53

Do not:
- implement the full scoring engine here unless needed for minimal consistency
- build dashboard UI here

When responding:
1. inspect relevant files first
2. explain the chosen model and future usage
3. implement the code
4. list exact files changed
5. suggest branch name for #26
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #29 — Activity Event Ingestion Endpoint

```text
Work on GitHub issue #29: [backend] Implement activity event ingestion endpoint.

Inspect the current backend first:
- application service conventions
- DTO patterns
- validation patterns
- auth/permission attributes
- DataSentinel entities and DbContext
- tenant scoping conventions

Goal:
Implement an ingestion API for ActivityEvent creation using simulated monitoring data.

Expected scope:
- add request DTO(s)
- add application service / endpoint for ingesting one or more activity events if consistent with repo style
- validate and normalize fields
- persist events safely
- sanitize evidence metadata where needed
- apply permissions appropriately
- keep the endpoint defensive and suitable for simulated/demo input

Do not:
- implement anomaly detection unless this issue naturally triggers a follow-up hook
- add offensive or risky behavior
- expose unsafe raw database internals

When responding:
1. inspect existing files first
2. explain exactly how ingestion should be added in this repo
3. implement code
4. list exact files changed
5. suggest branch name for #29
6. suggest at least 3 commit messages
7. note assumptions, blockers, and whether later detection hooks are still pending
```

---

## #30 — Activity Event Query and Filtering Endpoints

```text
Work on GitHub issue #30: [backend] Implement activity event query and filtering endpoints.

Inspect the repo first:
- application service patterns
- paging/sorting/filter DTO patterns
- authorization conventions
- repository/query practices
- current frontend API consumption patterns if available

Goal:
Implement backend query/filter endpoints for activity event monitoring.

Expected scope:
- paged/list endpoint(s) for ActivityEvent
- filtering by date range, user, IP, event type, severity, database, server, success/failure, operation
- sensible sorting support
- DTOs for list/detail if needed
- permission checks
- tenant isolation
- indexing-aware querying where practical

Do not:
- build frontend in this issue
- overcomplicate search with generic query builders if repo already has conventions

When responding:
1. inspect relevant files first
2. explain the API/query design
3. implement changes
4. list exact files changed
5. suggest branch name for #30
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #32 — Activity Event Monitoring View

```text
Work on GitHub issue #32: [frontend] Implement activity event monitoring view.

Inspect the frontend repo first:
- app router structure
- protected route patterns
- current auth/session hooks
- existing dashboard/list/table UI conventions
- tenant-aware API utilities
- styling/UI library patterns
- design reference files if present

Goal:
Build the frontend monitoring view for browsing and filtering activity events.

Expected scope:
- add activity events page/route in the correct frontend area
- fetch from backend activity query endpoint
- render table/list/cards according to current design patterns
- support filters such as date, severity, actor, event type, database/server if backend supports them
- include loading, empty, and error states
- use badges/timestamps/summary formatting consistent with current UI direction

Do not:
- redesign the whole app shell
- use inline styling if current repo avoids it
- add fake local-only data if backend exists

When responding:
1. inspect relevant frontend files first
2. explain how the page fits into current frontend structure
3. implement code
4. list exact files changed
5. suggest branch name for #32
6. suggest at least 3 commit messages
7. note blockers/dependencies on backend issue #30
```

---

## #34 — Batch Activity Import Support

```text
Work on GitHub issue #34: [backend] Implement batch activity import support.

Inspect current backend first:
- ingestion endpoint/service
- DTO patterns
- validation/error handling conventions
- JSON upload/import patterns if any

Goal:
Implement batch import support for ActivityEvent ingestion for demo/simulated data.

Expected scope:
- batch DTOs for multiple activity events
- efficient validation and persistence flow
- partial failure strategy or transactional behavior consistent with repo conventions
- clear error responses
- permission checks
- optional JSON import support if cleanly supported in current API style

Do not:
- introduce unnecessary file-processing complexity
- overengineer background jobs unless already used in repo

When responding:
1. inspect current files first
2. explain chosen import behavior and validation strategy
3. implement changes
4. list exact files changed
5. suggest branch name for #34
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #37 — Anomaly Detection Service

```text
Work on GitHub issue #37: [backend] Implement anomaly detection service.

Inspect the current repo first:
- DataSentinel entities
- service conventions
- dependency injection patterns
- testing structure
- alert rule models already added

Goal:
Implement the core anomaly detection service as a modular backend domain/application service that evaluates activity events against deterministic rules.

Expected scope:
- create anomaly detection service interface and implementation
- evaluate activity events against enabled AlertRules
- structure the service so rule handlers are modular/testable
- prepare integration with alert creation
- keep the design explainable and deterministic
- add unit tests for service behavior where practical

Do not:
- hardcode AI behavior here
- tightly couple rule evaluation to controllers
- overengineer a full rule engine framework

When responding:
1. inspect relevant files first
2. explain detection architecture based on repo conventions
3. implement code
4. list exact files changed
5. suggest branch name for #37
6. suggest at least 3 commit messages
7. note assumptions/blockers and dependent issues #39/#41/#42/#43
```

---

## #39 — Threshold-Based Anomaly Detection Rules

```text
Work on GitHub issue #39: [backend] Implement threshold-based anomaly detection rules.

Inspect current anomaly detection code first.

Goal:
Add threshold-based rule evaluation to the anomaly detection service.

Expected scope:
- implement threshold rule evaluation using AlertRule configuration
- support windows/counts/grouping as already modeled
- generate deterministic findings suitable for later alert creation
- add tests covering above-threshold and below-threshold behavior
- keep code modular for future rule types

Do not:
- mix unrelated rules into this issue unless necessary
- bypass the existing rule abstraction added for #37

When responding:
1. inspect relevant files first
2. explain how threshold rules fit the current implementation
3. implement changes
4. list exact files changed
5. suggest branch name for #39
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #41 — Out-of-Hours Activity Detection

```text
Work on GitHub issue #41: [backend] Implement out-of-hours activity detection.

Inspect the current anomaly detection service and ActivityEvent model first.

Goal:
Implement deterministic out-of-hours activity detection.

Expected scope:
- define out-of-hours detection based on event time and existing event fields
- support escalation for privileged/risky actions where applicable
- integrate with rule evaluation and alert generation flow
- add tests for normal-hours vs out-of-hours cases
- keep timezone handling consistent with repo and data assumptions

Do not:
- invent a complicated scheduling/calendar subsystem
- rely on undocumented local assumptions without noting them clearly

When responding:
1. inspect relevant files first
2. explain the rule logic and time assumptions
3. implement changes
4. list exact files changed
5. suggest branch name for #41
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #42 — Repeated Failure Detection Logic

```text
Work on GitHub issue #42: [backend] Implement repeated failure detection logic.

Inspect the current anomaly detection implementation, ActivityEvent model, and alert rule configuration first.

Goal:
Implement repeated failure detection, such as repeated failed login attempts or repeated failed access attempts within a time window.

Expected scope:
- group failures by relevant actor/user/IP/object as appropriate
- evaluate within configured time window
- create deterministic findings for later alerts
- add tests for threshold crossing and below-threshold cases
- keep grouping logic explicit and explainable

Do not:
- add vague ML-style scoring
- make grouping behavior implicit or magic

When responding:
1. inspect relevant files first
2. explain grouping/window logic
3. implement changes
4. list exact files changed
5. suggest branch name for #42
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #43 — Alert Creation and Alert-Event Linking

```text
Work on GitHub issue #43: [backend] Implement alert creation and alert-event linking.

Inspect current detection service, SecurityAlert entity, related models, and EF mappings first.

Goal:
Convert anomaly findings into persisted SecurityAlert records and link them to the contributing ActivityEvent records.

Expected scope:
- implement alert creation flow from detection results
- persist SecurityAlert with summary/evidence
- create explicit alert-event link model if needed
- ensure related event count and evidence references are accurate
- avoid duplicate noisy alerts where basic deduplication is clearly needed
- add tests covering alert creation from qualifying events

Do not:
- build full AI summarization here
- skip proper linkage if drill-down depends on it later

When responding:
1. inspect relevant files first
2. explain alert creation/linking design
3. implement changes
4. list exact files changed
5. suggest branch name for #43
6. suggest at least 3 commit messages
7. note assumptions/blockers and downstream issues
```

---

## #44 — Dashboard Summary Metrics Endpoint

```text
Work on GitHub issue #44: [backend] Implement dashboard summary metrics endpoint.

Inspect current backend application service structure and dashboard-related models first.

Goal:
Add a backend endpoint that returns high-level dashboard summary metrics for DataSentinel.

Expected scope:
- total alerts
- open alerts / reviewed / resolved counts as appropriate
- activity event totals
- recent anomalies or other concise summary metrics
- tenant-aware scoped metrics
- DTO designed for frontend dashboard cards
- permission checks for dashboard access

Do not:
- build the frontend here
- overload this endpoint with chart-specific payloads better suited to other issues

When responding:
1. inspect relevant files first
2. explain the summary metric design
3. implement changes
4. list exact files changed
5. suggest branch name for #44
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #45 — Activity Trend Visualisation Endpoints

```text
Work on GitHub issue #45: [backend] Implement activity trend visualisation endpoints.

Inspect repo patterns first.

Goal:
Implement backend endpoints for activity/event trend data used by dashboard charts.

Expected scope:
- time-bucketed activity/event counts
- filtering by date range and possibly event type/severity where practical
- DTOs suitable for frontend charting
- tenant-aware aggregation
- permission checks
- efficient querying

Do not:
- build the frontend chart here
- hardcode chart library concerns into backend payloads

When responding:
1. inspect relevant files first
2. explain aggregation design
3. implement changes
4. list exact files changed
5. suggest branch name for #45
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #46 — Alerts by Severity and Anomaly Timeline Endpoint

```text
Work on GitHub issue #46: [backend] Implement dashboard endpoint for alerts by severity and anomaly timeline.

Inspect existing dashboard endpoints and alert models first.

Goal:
Add backend dashboard endpoints for:
- alerts by severity
- anomaly timeline / alert timeline over time

Expected scope:
- aggregated counts by severity
- time-bucketed anomaly/alert counts
- DTOs suited for dashboard charts
- permission checks
- tenant isolation

Do not:
- duplicate logic already added in #44/#45 unnecessarily
- build frontend here

When responding:
1. inspect relevant files first
2. explain the endpoint structure and reuse strategy
3. implement changes
4. list exact files changed
5. suggest branch name for #46
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #48 — Top Risky Users and Entities Endpoint

```text
Work on GitHub issue #48: [backend] Implement top risky users and entities dashboard endpoint.

Inspect existing dashboard and UserRiskProfile-related code first.

Goal:
Implement backend support for showing top risky users/entities on the dashboard.

Expected scope:
- aggregate risky actors/users
- include supporting counts and/or risk score
- optionally include risky databases/servers/entities if current schema supports it
- DTO suited for dashboard panel rendering
- tenant-aware filtering
- permission checks

Do not:
- build frontend here
- invent complex analytics beyond MVP usefulness

When responding:
1. inspect relevant files first
2. explain the aggregation and data source choices
3. implement changes
4. list exact files changed
5. suggest branch name for #48
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #49 — Dashboard Overview Page

```text
Work on GitHub issue #49: [frontend] Implement dashboard overview page.

Inspect the frontend structure first:
- app router routes
- shell/layout patterns
- dashboard card components if any
- auth/permission guard patterns
- design package references
- API hooks/utilities

Goal:
Build the main DataSentinel dashboard overview page.

Expected scope:
- create the page in the correct protected route area
- fetch dashboard summary metrics from backend
- render dashboard overview cards and layout consistent with current design direction
- include loading, empty, and error states
- integrate permission-aware access if current frontend supports it

Do not:
- hardcode fake data unless explicitly necessary as fallback and clearly marked
- redesign the global app shell

When responding:
1. inspect relevant files first
2. explain how the page fits into the current frontend architecture
3. implement the code
4. list exact files changed
5. suggest branch name for #49
6. provide at least 3 commit messages
7. note blockers/dependencies on backend issues
```

---

## #50 — Dashboard Charts for Activity and Alert Trends

```text
Work on GitHub issue #50: [frontend] Implement dashboard charts for activity and alert trends.

Inspect the current frontend dashboard page, chart library usage, and API utilities first.

Goal:
Implement chart panels for activity and alert/anomaly trends using the backend dashboard endpoints.

Expected scope:
- wire chart components to activity trend and alert/anomaly timeline endpoints
- keep chart rendering aligned with current UI library and repo conventions
- handle loading/error/empty states cleanly
- integrate into dashboard layout without breaking the overview page

Do not:
- change backend contracts unless truly necessary
- overcomplicate chart components with unrelated abstractions

When responding:
1. inspect relevant files first
2. explain the chart integration approach
3. implement changes
4. list exact files changed
5. suggest branch name for #50
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #51 — Top Risky Users and Anomaly Timeline Panels

```text
Work on GitHub issue #51: [frontend] Implement top risky users and anomaly timeline panels.

Inspect the current dashboard page/components and the backend dashboard endpoints first.

Goal:
Add dashboard panels for:
- top risky users/entities
- anomaly timeline / severity-related panel as appropriate from current backend contracts

Expected scope:
- consume #48 and related dashboard endpoints
- render top risky users/entities in a clean panel/list/table
- render anomaly timeline panel consistent with design direction
- handle loading/error/empty states
- keep layout consistent with dashboard overview page

Do not:
- redesign existing chart components unnecessarily
- duplicate already-built dashboard logic

When responding:
1. inspect relevant files first
2. explain the panel design and integration
3. implement changes
4. list exact files changed
5. suggest branch name for #51
6. provide at least 3 commit messages
7. note blockers/dependencies
```

---

## #22 — Alerts List Page

```text
Work on GitHub issue #22: Alerts List Page.

Inspect the frontend repo first:
- routing/app structure
- auth/guard patterns
- table/list component conventions
- existing API utilities
- current DataSentinel navigation if any

Goal:
Build the main alerts list / incident queue page.

Expected scope:
- create the alerts list page in the correct protected frontend route
- fetch alert list data from backend
- render alert table/cards with severity, status, actor, created time, related event count, summary
- support loading, empty, and error states
- provide hooks for filtering and navigation to alert detail
- align with the design package where practical

Do not:
- implement all advanced filtering here unless backend/frontend structure already exists
- clutter the page with unrelated dashboard content

When responding:
1. inspect relevant files first
2. explain page design and routing integration
3. implement changes
4. list exact files changed
5. suggest branch name for #22
6. provide at least 3 commit messages
7. note blockers/dependencies on backend alert APIs
```

---

## #27 — Alert Filtering

```text
Work on GitHub issue #27: Alert Filtering.

Inspect current alerts list implementation and backend alert query capabilities first.

Goal:
Add filtering support for the alert queue.

Expected scope:
- frontend filter controls and/or backend filter DTO/query support as needed
- severity, status, date range, actor, rule, database/server filters where practical
- query-state synchronization according to current frontend conventions
- preserve clean UX and current routing/state patterns

Do not:
- build an overcomplicated search builder
- duplicate API logic already present

When responding:
1. inspect relevant files first
2. explain filtering architecture and where logic belongs
3. implement changes
4. list exact files changed
5. suggest branch name for #27
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #28 — Alert Detail Screen

```text
Work on GitHub issue #28: Alert Detail Screen.

Inspect existing alert list/data models and frontend route patterns first.

Goal:
Build the alert detail view for reviewing a single incident.

Expected scope:
- create alert detail page/route
- fetch detailed alert data
- show core alert metadata, summary, severity, status, actor, event range, evidence summary
- leave room for notes, status history, AI insight, and related events panels
- handle loading/error/not-found states
- keep design aligned with the current UI direction

Do not:
- implement every dependent panel in this issue unless necessary
- make assumptions not supported by backend data

When responding:
1. inspect relevant files first
2. explain page routing and composition
3. implement changes
4. list exact files changed
5. suggest branch name for #28
6. provide at least 3 commit messages
7. note blockers/dependencies
```

---

## #31 — Related Event History Drill-Down

```text
Work on GitHub issue #31: Related Event History Drill-Down.

Inspect backend alert-event linking and current alert detail frontend first.

Goal:
Implement related event history drill-down for an alert.

Expected scope:
- backend support if still missing for related events by alert
- frontend panel/table on alert detail page showing linked or related activity events
- allow analysts to inspect event history contributing to the alert
- support loading/empty/error states
- keep design clear and readable

Do not:
- dump raw JSON blobs without formatting
- bypass tenant isolation or permission checks

When responding:
1. inspect relevant files first
2. explain how related events will be retrieved and displayed
3. implement changes
4. list exact files changed
5. suggest branch name for #31
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #33 — Alert Status Management

```text
Work on GitHub issue #33: Alert Status Management.

Inspect current backend alert entity, status history entity, application services, and frontend alert detail/list first.

Goal:
Implement alert status changes such as reviewed, triaged, in-progress, resolved, false-positive.

Expected scope:
- backend endpoint/service to update alert status
- validation of allowed status transitions if appropriate
- persist AlertStatusHistory entries
- frontend controls on alert detail and/or list where appropriate
- permission enforcement for review/manage actions
- tests for status change and history creation

Do not:
- hide transition rules in the UI only
- skip history tracking

When responding:
1. inspect relevant files first
2. explain the status workflow design
3. implement changes
4. list exact files changed
5. suggest branch name for #33
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #35 — Bulk Alert Dismiss

```text
Work on GitHub issue #35: Bulk Alert Dismiss.

Inspect current alerts list, alert status APIs, and permission model first.

Goal:
Implement bulk dismissal / false-positive handling for multiple alerts.

Expected scope:
- backend endpoint/service for bulk status update
- permission checks
- status history creation for each affected alert
- frontend selection UI on alerts list page
- defensive validation and user feedback
- avoid unsafe or accidental mass updates where current UI can prevent it

Do not:
- bypass audit/history requirements
- add complex batch job behavior unless repo already uses it

When responding:
1. inspect relevant files first
2. explain bulk action design
3. implement changes
4. list exact files changed
5. suggest branch name for #35
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #36 — Incident Notes

```text
Work on GitHub issue #36: Incident Notes.

Inspect alert detail backend/frontend and IncidentNote entity first.

Goal:
Implement note/comment support on security alerts.

Expected scope:
- backend note create/list APIs
- permission checks
- note DTOs
- frontend notes panel on alert detail page
- note entry form and notes timeline/list
- loading/error/empty states
- tests for note creation where practical

Do not:
- mix notes into unrelated alert update endpoints if repo style prefers separation
- skip created by / created at metadata

When responding:
1. inspect relevant files first
2. explain notes API and UI design
3. implement changes
4. list exact files changed
5. suggest branch name for #36
6. provide at least 3 commit messages
7. note blockers/dependencies
```

---

## #38 — Status History Timeline

```text
Work on GitHub issue #38: Status History Timeline.

Inspect alert status management and alert detail UI first.

Goal:
Implement display of status history as a timeline/history panel.

Expected scope:
- backend query support if needed
- frontend status history timeline/list on alert detail page
- show from status, to status, changed by, changed at, optional comment
- handle empty/history states clearly
- use current UI styling conventions

Do not:
- duplicate status update logic
- hide important status transition context

When responding:
1. inspect relevant files first
2. explain how history data flows to the detail page
3. implement changes
4. list exact files changed
5. suggest branch name for #38
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #40 — Export Incident Report

```text
Work on GitHub issue #40: Export Incident Report.

Inspect backend alert detail/reporting patterns and frontend alert detail page first.

Goal:
Implement incident report export for a security alert in a realistic MVP-friendly way.

Expected scope:
- choose a pragmatic export format based on repo capabilities, such as JSON, CSV, or simple printable/report DTO; PDF only if already practical in repo
- backend endpoint/service to produce export payload
- permission check for export
- frontend trigger/button from alert detail or alerts list
- include key incident information, notes/status history if appropriate, and evidence summary
- keep export defensive and sanitized

Do not:
- introduce heavy document generation complexity unless already supported
- include secrets or unsafe raw evidence

When responding:
1. inspect relevant files first
2. explain export format choice and implementation approach
3. implement changes
4. list exact files changed
5. suggest branch name for #40
6. provide at least 3 commit messages
7. note blockers/dependencies
```

---

## #47 — AI-Generated Alert Summary and Explanation

```text
Work on GitHub issue #47: AI-Generated Alert Summary and Explanation.

Inspect current backend alert detail code, AI/service abstractions if any, config handling, and alert detail frontend first.

Goal:
Implement AI-generated summary and explanation for a security alert in a safe, defensive, structured way.

Expected scope:
- introduce or extend an AI insight service abstraction
- sanitize/redact alert context before provider use
- return structured output with summary and whyFlagged
- add backend endpoint for alert AI insight
- add frontend panel on alert detail page to display AI explanation
- provide deterministic fallback if provider is not configured yet, or prepare for #54
- keep guidance defensive only

Required output shape should include at least:
- summary
- whyFlagged
- redactionNote
- fallbackUsed if applicable

Do not:
- hardcode secrets
- send raw sensitive evidence unsanitized
- provide offensive or exploit-style guidance

When responding:
1. inspect relevant files first
2. explain the AI abstraction and prompt-shaping approach
3. implement changes
4. list exact files changed
5. suggest branch name for #47
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #52 — Suggested Investigation Next Step

```text
Work on GitHub issue #52: Suggested Investigation Next Step.

Inspect current AI insight implementation and alert detail UI first.

Goal:
Extend AI-supported incident explanation to include suggested next investigation steps.

Expected scope:
- add structured recommendedNextSteps to AI output
- keep guidance defensive, practical, and non-offensive
- base next steps on available alert evidence/rule type/severity
- show recommendations clearly in frontend alert detail UI
- preserve fallback support

Do not:
- generate unsafe step-by-step attack instructions
- return vague filler recommendations without evidence basis

When responding:
1. inspect relevant files first
2. explain how next-step recommendations are derived or prompted
3. implement changes
4. list exact files changed
5. suggest branch name for #52
6. provide at least 3 commit messages
7. note blockers/dependencies
```

---

## #53 — Priority and Risk Explanation for High-Severity Alerts

```text
Work on GitHub issue #53: Priority and Risk Explanation for High-Severity Alerts.

Inspect current AI insight flow, alert severity model, and risk-related code first.

Goal:
Add AI-assisted priority and risk explanation for high-severity alerts.

Expected scope:
- extend AI output structure with severityReasoning and likelyCause
- explain why an alert is high priority in plain language
- reference evidence/rule overlap/risk indicators where available
- surface priority reasoning in frontend alert detail
- keep structured, explainable, and defensive

Do not:
- invent unsupported certainty
- hide confidence or limitations

When responding:
1. inspect relevant files first
2. explain how priority reasoning is generated
3. implement changes
4. list exact files changed
5. suggest branch name for #53
6. suggest at least 3 commit messages
7. note blockers/dependencies
```

---

## #54 — Fallback Behavior When AI Is Unavailable

```text
Work on GitHub issue #54: Fallback Behavior When AI Is Unavailable.

Inspect the current AI service abstraction, config patterns, and alert detail UI first.

Goal:
Implement robust fallback behavior when AI is unavailable, disabled, misconfigured, or errors out.

Expected scope:
- add fallback provider or fallback response path
- return structured fallbackUsed flag and safe explanation
- ensure backend does not fail the alert detail experience just because AI is unavailable
- show clear but polished UI messaging in frontend
- keep fallback useful for demo mode

Fallback output should still aim to provide:
- summary
- whyFlagged
- recommendedNextSteps if feasible
- redactionNote
- fallbackUsed = true

Do not:
- crash the page on provider errors
- expose raw provider exceptions to end users

When responding:
1. inspect relevant files first
2. explain fallback strategy and config behavior
3. implement changes
4. list exact files changed
5. suggest branch name for #54
6. provide at least 3 commit messages
7. note assumptions/blockers
```

---

## #8 — Setup Agentic Documentation

```text
Work on GitHub issue #8: [doc] setup agentic documentation.

Inspect the repository first for:
- README files
- .codex folder
- AGENTS.md
- architecture docs
- setup docs
- frontend/backend run instructions
- deployment notes
- migration instructions

Goal:
Improve the repository documentation so agentic coding tools can work effectively and future contributors can understand DataSentinel.

Expected scope:
- add or improve .codex guidance files if they already exist or are expected in repo
- improve AGENTS.md / rules / architecture/setup docs as appropriate
- document repo structure, coding constraints, auth/tenant expectations, migration flow, test commands, issue-driven implementation guidance
- include DataSentinel-specific architectural guidance rather than generic documentation
- align documentation with the actual repo, not aspirational architecture

Do not:
- write vague generic AI-assistant docs
- document features that are not actually in the repo

When responding:
1. inspect existing documentation first
2. explain what docs are missing or weak
3. implement the documentation changes
4. list exact files changed
5. suggest branch name for #8
6. suggest at least 3 commit messages
7. note assumptions/blockers
```

---

## #5 — Run Deployed Backend to Do Migrations

```text
Work on GitHub issue #5: [deploy] Run deployed backend to do migrations.

Inspect the repo first for:
- deployment docs
- appsettings/env variable patterns
- EF Core migration execution flow
- Render or hosting-related config if present
- startup/migration initialization patterns

Goal:
Prepare or improve the repository so deployed backend migrations can run safely and predictably.

Expected scope:
- identify how migrations are currently expected to run in deployed environments
- add or improve deployment/migration documentation
- adjust startup/config only if needed and safe
- ensure environment variables and DB connection expectations are clearly documented
- keep the implementation aligned with ABP and existing deployment style

Do not:
- hardcode production secrets
- make unsafe startup-time changes without clearly explaining them
- pretend to execute deployment if repo-only changes are what is actually possible

When responding:
1. inspect existing deployment and migration files first
2. explain current migration/deploy path and any problems
3. implement safe repo-side improvements
4. list exact files changed
5. suggest branch name for #5
6. provide at least 3 commit messages
7. clearly state what can be changed in repo versus what must be done in the hosting platform
```

---

# Recommended Dependency Order for Your Issues

This is the order I’d push Codex through, because many of the later issues depend on the earlier ones:

## Foundation

* #20
* #21
* #23
* #24
* #25
* #26

## Intake

* #29
* #30
* #34
* #32

## Detection

* #37
* #39
* #41
* #42
* #43

## Dashboard backend then frontend

* #44
* #45
* #46
* #48
* #49
* #50
* #51

## Alert workflow

* #22
* #27
* #28
* #33
* #36
* #38
* #31
* #35
* #40

## AI

* #47
* #52
* #53
* #54

## Docs / Deploy

* #8
* #5

---

# Best Way to Use This With Codex

Use this sequence:

### First prompt

Use the **master prompt**.

### Then per issue

Paste the relevant **issue prompt** exactly.

### Good follow-up after an issue

Use:

```text
Continue issue #__ from the current branch state. Reinspect the changed files first, then finish any missing tests, permissions, UI states, and docs needed for the issue to be truly complete.
```

### Good transition to the next issue

Use:

```text
Now move to issue #__. First inspect the current repo state and confirm what was completed in prior dependent issues, then implement only the scope needed for this issue plus minimal supporting code.
```

---

If you want, next I can turn this into a **clean GitHub-ready issue prompt pack document** you can save as something like `docs/codex-datasentinel-issue-prompts.md`.
