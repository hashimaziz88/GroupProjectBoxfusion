# Skill 5 — Persistence, Deduplication, and Background Worker

## Prerequisite
Skills 1–4 must be complete and compiling before this skill is started.

## What this skill does
1. Replace the `CreateAlertIfNotDuplicateAsync` stub in `RulesetEngineAppService`
   with full deduplication + SecurityAlert + AlertStatusHistory persistence
2. Create `RulesetEngineBackgroundWorker` in the Core project
3. Register the worker in `Team2GroupProjectCoreModule`

---

## Part A — CreateAlertIfNotDuplicateAsync

### File
`RulesetEngineAppService.cs` — replace the stub body only.

### Deduplication strategy
There is no `DeduplicationKey` column on `SecurityAlert`.
Deduplication is done by querying the `SecurityAlerts` table for an existing
open alert that matches all of the following:
- Same `RuleId`
- Same `TenantId`
- Status is NOT `Resolved` AND NOT `Dismissed` (i.e. still open)
- The candidate's `EventTimeStart` falls within the existing alert's
  `EventTimeStart..EventTimeEnd` window

```csharp
var isDuplicate = await _securityAlertRepository.GetAll()
    .AnyAsync(x =>
        x.TenantId == tenantId &&
        x.RuleId == rule.Id &&
        x.Status != SecurityAlertStatus.Resolved &&
        x.Status != SecurityAlertStatus.Dismissed &&
        x.EventTimeStart <= candidate.EventTimeStart &&
        x.EventTimeEnd   >= candidate.EventTimeStart);

if (isDuplicate)
    return;
```

### Build the SecurityAlert entity
Use the public constructor — never set fields by hand that the constructor owns.

```csharp
var alert = new SecurityAlert(
    tenantId:          tenantId,
    ruleId:            rule.Id,
    title:             candidate.Title,
    summary:           candidate.Summary,
    severity:          rule.Severity,
    triggeredAt:       Clock.Now,
    eventTimeStart:    candidate.EventTimeStart,
    eventTimeEnd:      candidate.EventTimeEnd,
    relatedEventCount: candidate.RelatedEventCount);
```

Then set the optional navigation/scope fields:
```csharp
alert.TriggeringActivityEventId = candidate.TriggeringEventId;
alert.PrimaryActorUser          = candidate.PrimaryActorUser;
alert.PrimaryActorIp            = candidate.PrimaryActorIp;
alert.DatabaseId                = candidate.DatabaseId;
alert.ServerId                  = candidate.ServerId;
alert.EvidenceSummaryJson       = candidate.EvidenceSummaryJson;
```

### Persist the SecurityAlert
```csharp
await _securityAlertRepository.InsertAsync(alert);
```

### Create the initial AlertStatusHistory row
The `SecurityAlert` constructor sets `Status = New` silently without calling
`TransitionTo`, so no history row is written automatically.
You must write it explicitly here, right after the insert:

```csharp
var historyEntry = new AlertStatusHistory(
    tenantId:   tenantId,
    alertId:    alert.Id,
    fromStatus: SecurityAlertStatus.New,
    toStatus:   SecurityAlertStatus.New,
    comment:    "Alert created by ruleset engine");

await CurrentUnitOfWork.GetDbContext<Team2GroupProjectDbContext>()
    // OR use the repository if an IAlertStatusHistoryRepository exists
    // Otherwise: context.AlertStatusHistoryEntries.Add(historyEntry)
```

Check whether `IAlertStatusHistoryRepository` exists in the codebase.
If it does, inject it in the constructor and use it.
If it does not, access the DbContext via `IDbContextProvider<Team2GroupProjectDbContext>`
injected in the constructor.

### Save changes
```csharp
await CurrentUnitOfWork.SaveChangesAsync();
```
Called once after both inserts — same pattern as `IngestInternalAsync`.

---

## Part B — RulesetEngineBackgroundWorker

### File location
```
src/Team2GroupProject.Core/DataSentinel/RulesetEngine/RulesetEngineBackgroundWorker.cs
```
This is the ONLY file that belongs in Core for this feature.
The service and interface remain in Application.

### Class declaration
```csharp
public class RulesetEngineBackgroundWorker : AsyncPeriodicBackgroundWorkerBase
```
Inherits `AsyncPeriodicBackgroundWorkerBase` from ABP.
This is the correct ABP class for scheduled recurring work.

### Constructor
```csharp
public RulesetEngineBackgroundWorker(
    AbpTimer timer,
    IIocResolver iocResolver)
    : base(timer, iocResolver)
{
    timer.Period = 5 * 60 * 1000; // 5 minutes in milliseconds
}
```

### DoWorkAsync override
```csharp
protected override async Task DoWorkAsync(PeriodicBackgroundWorkerContext workerContext)
{
    var tenantManager = workerContext.ServiceProvider
        .GetRequiredService<ITenantManager>();

    var engineService = workerContext.ServiceProvider
        .GetRequiredService<IRulesetEngineAppService>();

    var tenants = await tenantManager.GetAllActiveTenantsAsync();

    foreach (var tenant in tenants)
    {
        await engineService.EvaluateAllRulesAsync(tenant.Id);
    }
}
```

If `ITenantManager.GetAllActiveTenantsAsync()` does not exist in the codebase,
look for the equivalent ABP method that returns active tenants and use that instead.
Common alternatives: `TenantManager.Tenants.Where(t => t.IsActive).ToListAsync()`.

### Do NOT use AbpSession inside the worker
The worker has no session context. The tenant ID is passed explicitly to the service.

---

## Part C — Register the Worker

### File
`src/Team2GroupProject.Core/Team2GroupProjectCoreModule.cs`

Add to `PostInitialize()`:
```csharp
public override void PostInitialize()
{
    IocManager.Resolve<AppTimes>().StartupTime = Clock.Now;

    // Register the ruleset engine background worker
    var workerManager = IocManager.Resolve<IBackgroundWorkerManager>();
    workerManager.Add(IocManager.Resolve<RulesetEngineBackgroundWorker>());
}
```

---

## Checklist before marking Skill 5 complete
- [ ] `CreateAlertIfNotDuplicateAsync` stub is fully replaced
- [ ] Dedup query uses `RuleId` + `TenantId` + open status + window overlap
- [ ] `SecurityAlert` is built using the public constructor
- [ ] Optional fields set after construction, not passed to constructor
- [ ] `AlertStatusHistory` row inserted explicitly after alert insert
- [ ] `SaveChangesAsync()` called once after both inserts
- [ ] `RulesetEngineBackgroundWorker` created in `Core/DataSentinel/RulesetEngine/`
- [ ] Worker inherits `AsyncPeriodicBackgroundWorkerBase`
- [ ] Timer period is 5 minutes (300000ms)
- [ ] Worker registered in `PostInitialize()` of `Team2GroupProjectCoreModule`
- [ ] No `AbpSession` usage inside the worker
- [ ] Project compiles with no errors