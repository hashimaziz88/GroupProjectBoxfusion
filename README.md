# DataSentinel

## What is DataSentinel?

DataSentinel is a SQL security and anomaly monitoring platform built to help teams detect suspicious database activity early. The system focuses on monitoring SQL-related events, highlighting risky behavior, and presenting security insights through dashboards, alerts, and investigation workflows.

## Why Choose DataSentinel?

Security-focused monitoring: DataSentinel is centered on suspicious SQL activity, not just generic analytics.

Anomaly detection: The platform surfaces unusual transaction spikes, repeated failures, out-of-hours activity, and risky privileged actions.

Actionable investigation flow: Analysts can review alerts, update incident status, add notes, and export reports.

AI-assisted insights: The platform includes AI-supported summaries, triage guidance, and alert explanations to help teams investigate faster.

# Documentation

## Software Requirement Specification

### Problem statement

Modern organizations generate large volumes of SQL and audit activity, but suspicious behavior is often buried inside routine operational noise. Without focused visibility, teams may miss failed login spikes, unusual write bursts, risky privileged operations, and off-hours access until after damage has already occurred. DataSentinel was built to provide security-oriented observability for database activity so that suspicious patterns can be detected, reviewed, and investigated earlier.

### Components and Functional Requirement

**1. Authentication and authorization management**

- users can access the platform through the existing authentication flow
- protected routes enforce permission-based access
- tenant-scoped access is supported for DataSentinel workspaces

**2. Monitoring infrastructure management**

- administrators can register monitored servers
- administrators can register monitored databases
- administrators can register monitored tables
- demo monitoring infrastructure can be bootstrapped for the project

**3. Activity intake and monitoring**

- users can ingest simulated SQL activity data
- users can import audit log style activity batches
- users can browse monitored activity events
- users can filter activity by server, database, user, IP, operation, severity, and date

**4. Detection and security alerts**

- the system flags suspicious events using rule-based detection
- the system detects unusual read or write spikes
- the system flags out-of-hours activity
- the system detects repeated failure patterns
- the system identifies risky privileged access patterns

**5. Incident handling and reporting**

- analysts can review alert queues
- analysts can mark incidents through a status lifecycle
- analysts can add investigation notes
- users can export incident and summary reports

**6. AI integration**

- AI can summarize suspicious patterns
- AI can explain why an alert was flagged
- AI can prioritize alert triage
- AI can suggest the next investigation step


### Architecture overview

DataSentinel uses a split frontend and backend architecture:

- the frontend is a Next.js application in `team-2-group-project`
- the backend is an ASP.NET Core application in `aspnet-core`
- the backend stores monitoring infrastructure, activity events, alerts, incident notes, and user risk profiles
- the frontend consumes backend APIs for dashboards, activity monitoring, alerts, reporting, and intake workflows
- AI-assisted summaries are exposed through frontend API routes that call an external model provider when configured


# Design

## Wireframes

https://www.figma.com/make/p4fdXjU9pyS5JwiOdBZkLd/Design-Data-Sentinels-Dashboard?p=f

## Domain Model

![Domain Model](Domain-Model.png)

# Setup

## Setup steps

1. Clone the repository.
2. Open the backend solution in `aspnet-core`.
3. Install frontend dependencies in `team-2-group-project` with `npm install`.
4. Copy `team-2-group-project/.env.example` to `team-2-group-project/.env.local`.
5. Set `NEXT_PUBLIC_API_LINK` to the backend host URL, typically `https://localhost:____`.
6. Configure the server-side AI provider key in the frontend environment.
7. Start the backend first.
8. Start the frontend with `npm run dev`.

# Running application

## Repository structure

- `team-2-group-project` - Next.js frontend
- `aspnet-core` - ASP.NET Core backend

## Frontend

From `team-2-group-project`:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set:

# Base URL of the backend API

# Option 1: Local backend (recommended)
NEXT_PUBLIC_API_LINK=https://localhost:____

# Option 2: Deployed backend
# NEXT_PUBLIC_API_LINK=https://groupprojectboxfusion.onrender.com/

# AI integration (used for alert summaries)
# If not provided, AI features will be disabled
NEXT_PUBLIC_AI_API_KEY=your-api-key-here

If you do not have a key, you can get one from here:
https://console.groq.com/keys

Then run:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Backend

### Visual Studio

- open `aspnet-core/Team2GroupProject.sln`
- set `Team2GroupProject.Web.Host` as the startup project
- build and run the application

### .NET CLI

From `aspnet-core`:

```bash
dotnet restore Team2GroupProject.sln
dotnet build Team2GroupProject.sln
dotnet run --project src/Team2GroupProject.Web.Host/Team2GroupProject.Web.Host.csproj
```

## Assumptions

- the platform uses simulated or imported SQL and audit-style activity rather than direct live database agents
- the project runs in a tenant-aware environment and most DataSentinel views are tenant-scoped
- the backend is the source of truth for monitoring data, alert lifecycle state, and permissions
- AI features depend on external API configuration

## Trade-offs

- rule-based anomaly detection was prioritized over a heavier machine learning approach to keep the system explainable and achievable within project scope
- batch and simulated ingestion were implemented before live streaming ingestion to reduce infrastructure complexity
- the system favors security-focused workflows over broad BI-style analytics
- AI support is assistive only and does not replace deterministic detection or analyst review
- report exports are lightweight and practical for demos, but not yet a full enterprise reporting pipeline

## AI Usage Disclosure

This project was developed with the assistance of AI tools to support various stages of the development process.

AI was used in the following areas:
- **Design support**: brainstorming features, refining requirements, and shaping user flows
- **Architecture guidance**: discussing system design decisions, trade-offs, and implementation strategies
- **Development assistance**: generating code snippets, suggesting implementations, and accelerating development
- **Debugging support**: identifying issues, explaining errors, and proposing fixes
- **Test creation**: assisting in writing and structuring unit and integration tests

All AI-generated suggestions were **reviewed, adapted, and integrated by the development team**. Final implementation decisions, system design, and code quality remain the responsibility of the team.

AI was used as a **development aid**, not as a replacement for understanding, and care was taken to ensure correctness, maintainability, and alignment with project requirements.
