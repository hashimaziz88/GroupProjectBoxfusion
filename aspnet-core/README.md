# DataSentinel Backend

This directory contains the ASP.NET Core backend for DataSentinel. It is the system of record for authentication, tenant-aware access, monitored infrastructure, SQL activity intake, anomaly detection, security alerts, incident notes, and reporting.

This document is the backend contributor guide for local setup, configuration, migrations, API discovery, and daily development.

## What Lives Here

The backend is an ABP-based ASP.NET Core solution targeting `.NET 8`.

- `src/Team2GroupProject.Web.Host` - executable host, Swagger UI, JWT auth wiring, CORS, SignalR endpoint
- `src/Team2GroupProject.Web.Core` - ABP web module, token auth controller, app service auto-controller registration
- `src/Team2GroupProject.Application` - application services and DTOs, including the DataSentinel use cases
- `src/Team2GroupProject.Core` - domain entities, authorization, multi-tenancy, and core DataSentinel models
- `src/Team2GroupProject.EntityFrameworkCore` - EF Core db context, migrations, and seeders
- `src/Team2GroupProject.Migrator` - command-line migrator used to apply migrations and seed the database
- `test` - unit and web test projects

## DataSentinel Backend Areas

The backend currently exposes DataSentinel functionality through ABP app services in these areas:

- `ActivityEvent` - ingest simulated SQL activity and audit-style batches, browse/filter events
- `MonitoringInfrastructure` - manage monitored servers, databases, tables, and demo bootstrap data
- `Dashboards` - summary and dashboard-facing metrics
- `AnomalyDetection` - rule-based suspicious activity detection
- `SecurityAlert` - alert queue, alert detail, filtering, and status changes
- `IncidentNote` - investigation notes
- `IncidentReport` - report export and incident summaries

## Prerequisites

- `.NET SDK 8.x`
- PostgreSQL
- Visual Studio 2022 or later, or the `.NET CLI`
- Optional: Docker Desktop if you want to use the containerized PostgreSQL or the compose-based stack

Confirm your SDK:

```powershell
dotnet --version
```

## Configuration Strategy

Do not rely on the committed connection string or JWT values for local development. Override them locally with user secrets or environment variables.

Recommended local override options:

1. User secrets for the host project
2. Environment variables for both the host and migrator

Example user secret override for the web host:

```powershell
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=____;Database=Team2GroupProjectDb;Username=your-db-user;Password=your-db-password" --project .\src\Team2GroupProject.Web.Host\Team2GroupProject.Web.Host.csproj
dotnet user-secrets set "App:ClientRootAddress" "http://localhost:____/" --project .\src\Team2GroupProject.Web.Host\Team2GroupProject.Web.Host.csproj
dotnet user-secrets set "App:CorsOrigins" "http://localhost:____" --project .\src\Team2GroupProject.Web.Host\Team2GroupProject.Web.Host.csproj
```

Example environment variable overrides for PowerShell:

```powershell
$env:ConnectionStrings__Default="Host=localhost;Port=____;Database=Team2GroupProjectDb;Username=your-db-user;Password=your-db-password"
$env:App__ClientRootAddress="http://localhost:____/"
$env:App__CorsOrigins="http://localhost:____"
```

If you use the migrator, apply the same connection string override in the shell before running it so the host and migrator point at the same database.

## Local Run Paths

### 1. Local host + local PostgreSQL on `localhost:____`

Use this when PostgreSQL is installed directly on your machine.

1. Create a local PostgreSQL database and credentials for the app.
2. Override `ConnectionStrings:Default` for the host and migrator.
3. Run the migrator.
4. Start the web host.

Recommended commands from this directory:

```powershell
dotnet restore .\Team2GroupProject.sln
dotnet build .\Team2GroupProject.sln
dotnet run --project .\src\Team2GroupProject.Migrator\Team2GroupProject.Migrator.csproj
dotnet run --project .\src\Team2GroupProject.Web.Host\Team2GroupProject.Web.Host.csproj
```

By default, the host launches on `https://localhost:____`.

### 2. Local host + Dockerized PostgreSQL on `localhost:____`

Use this when you want the app to run locally but prefer PostgreSQL in Docker.

The compose file in [`docker/ng/docker-compose.yml`](C:\Users\Jason\Desktop\GroupProjectBoxfusion\aspnet-core\docker\ng\docker-compose.yml) exposes PostgreSQL on a host port. Point your local host and migrator overrides at that port instead of your usual local PostgreSQL port.

Example shape:

```powershell
$env:ConnectionStrings__Default="Host=localhost;Port=____;Database=Team2GroupProjectDb;Username=your-db-user;Password=your-db-password"
```

Then run:

```powershell
docker compose -f .\docker\ng\docker-compose.yml up -d postgres
dotnet run --project .\src\Team2GroupProject.Migrator\Team2GroupProject.Migrator.csproj
dotnet run --project .\src\Team2GroupProject.Web.Host\Team2GroupProject.Web.Host.csproj
```

### 3. Full Docker compose flow from `docker/ng/docker-compose.yml`

Use this only if you want the compose-defined stack rather than a normal source-based backend workflow.

The compose file starts:

- a PostgreSQL container
- an `abp_host` container listening on a host port
- an `abp_ng` container on a host port

Start it with:

```powershell
docker compose -f .\docker\ng\docker-compose.yml up -d
```

Notes:

- This is not the primary contributor path for editing backend source code.
- The compose file uses its own environment settings and container images, so keep it separate from the normal local `dotnet run` workflow.
- If something behaves differently between compose and local development, trust the source-based workflow first.

## Visual Studio Workflow

1. Open [`Team2GroupProject.sln`](C:\Users\Jason\Desktop\GroupProjectBoxfusion\aspnet-core\Team2GroupProject.sln).
2. Set `Team2GroupProject.Web.Host` as the startup project.
3. Override your connection string locally before running.
4. Run `Team2GroupProject.Migrator` once when the database is new or migrations changed.
5. Start debugging the host.

The launch profile is configured for `https://localhost:____`.

## Migrations And Seeding

The backend uses EF Core migrations from `src/Team2GroupProject.EntityFrameworkCore`. Apply schema updates through the migrator project:

```powershell
dotnet run --project .\src\Team2GroupProject.Migrator\Team2GroupProject.Migrator.csproj
```

The migrator:

- applies pending migrations
- creates the default ABP tenant
- seeds host and tenant roles/users
- runs DataSentinel tenant role seeding

If you need to create or update migrations, use the EF Core tooling against the existing db context in `Team2GroupProject.EntityFrameworkCore`. Keep the generated migration files in the EF Core project.

## Seeded Access

The EF seeders create separate admin access for host and tenant scopes.

- Host admin:
  - username: `admin`
  - email: `admin@aspnetboilerplate.com`
- Default tenant:
  - tenancy name: `Default`
  - tenant admin username: `admin`
  - tenant admin email: `admin@defaulttenant.com`

The seeded admin password is the same for both accounts in the current seeders. Change it immediately in any shared or long-lived environment.

When authenticating as the default tenant admin from the frontend or API client, make sure the tenant context is set to `Default`.

## API Shape

This backend does not expose only hand-written MVC controllers. It uses ABP app services that are auto-exposed under `/api/services/app/...`, plus a few explicit controllers.

Important public surfaces:

- `POST /api/TokenAuth/Authenticate` - JWT login
- `POST /api/services/app/Account/Register` - user registration
- `POST /api/services/app/Account/IsTenantAvailable` - tenant availability check
- `/api/services/app/...` - ABP app service endpoints for DataSentinel, users, roles, tenants, sessions, and configuration
- `/signalr` - SignalR hub endpoint
- `/swagger` - interactive API documentation

Swagger is the authoritative endpoint inventory. Use it instead of duplicating a long endpoint table here.

### Swagger

Run the host and open:

```text
https://localhost:____/swagger
```

Swagger is wired in the host project and documents both the standard ABP services and the DataSentinel-specific services.

### Authentication

JWT bearer auth is enabled in the host. Typical flow:

1. Authenticate through `POST /api/TokenAuth/Authenticate`
2. Read the returned access token
3. Send `Authorization: Bearer <token>` on protected requests

SignalR support is also configured, with encrypted auth tokens accepted on the `/signalr` path.

## Frontend Integration

The frontend workspace is in [`team-2-group-project`](C:\Users\Jason\Desktop\GroupProjectBoxfusion\team-2-group-project).

Backend defaults and expectations:

- backend dev URL: `https://localhost:____`
- frontend should set `NEXT_PUBLIC_API_LINK=https://localhost:____`
- the host currently expects CORS origins such as `http://localhost:____`
- the host config also includes other localhost origins for alternate local clients

If requests succeed in Swagger or Postman but fail in the frontend, check:

- the frontend is pointing to the same backend base URL
- the backend CORS origins include the frontend origin exactly
- the frontend restarted after env file changes

## Troubleshooting

### Wrong PostgreSQL port

There are multiple valid backend run modes in this repo:

- local PostgreSQL usually means one port
- Dockerized PostgreSQL from the compose file may use a different host port

If the migrator connects but the host does not, or vice versa, the two processes are probably using different `ConnectionStrings:Default` values.

### HTTPS and localhost URL confusion

The launch settings and app settings are centered on `https://localhost:____`. If your frontend points somewhere else, login, Swagger, or CORS behavior may look broken even when the host is healthy.

### Migrations were not applied

If the host starts but API calls fail on missing tables or seed data, run the migrator first against the same database the host is using.

### JWT works in one client but not another

Check:

- the token was obtained from the same backend instance you are calling
- the request includes `Authorization: Bearer <token>`
- the tenant context is correct for tenant-scoped users

### CORS failures

If the browser reports CORS errors:

- verify the frontend origin matches `App:CorsOrigins`
- make sure you did not leave a trailing slash mismatch in your override values
- restart the backend after changing environment variables or user secrets

## Daily Development Checklist

1. Restore and build the solution.
2. Override the connection string locally.
3. Run the migrator against the intended database.
4. Start `Team2GroupProject.Web.Host`.
5. Confirm `https://localhost:____/swagger` loads.
6. Point the frontend `NEXT_PUBLIC_API_LINK` at the same backend URL.

## Related Docs

- Project overview: [`README.md`](GroupProjectBoxfusion\README.md)
- Frontend workspace guide: [`team-2-group-project/README.md`](GroupProjectBoxfusion\team-2-group-project\README.md)
