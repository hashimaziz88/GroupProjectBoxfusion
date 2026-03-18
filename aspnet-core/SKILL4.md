# Skill 4 — BulkOperation Evaluator

## Prerequisite
Skills 1, 2, and 3 must be complete and compiling before this skill is started.

## What this skill does
Replace the single stub body in `RulesetEngineAppService`:
- `EvaluateBulkOperationAsync`

No new files. All changes are inside `RulesetEngineAppService.cs`.

---

## Rule type behaviour
BulkOperation is a **per-event** rule — same as OutOfHours and PrivilegedAction.
One matching event produces one AlertCandidate.
`WindowMinutes` is NOT used for the threshold check — the threshold applies
to `RowsAffected` on a single event, not a count of events over time.
`ThresholdCount` on the rule is the minimum `RowsAffected` value that triggers the alert.

---

## singleEventId behaviour — same pattern as Skill 3
When `singleEventId` is not null, narrow to that event only (real-time path).
When `singleEventId` is null, use a 24-hour catch-up window (background worker path).

```csharp
var baseQuery = _activityEventRepository.GetAll()
    .Where(x => x.TenantId == tenantId);

if (singleEventId.HasValue)
{
    baseQuery = baseQuery.Where(x => x.Id == singleEventId.Value);
}
else
{
    var catchUpStart = Clock.Now.AddHours(-24);
    baseQuery = baseQuery.Where(x => x.EventTime >= catchUpStart);
}
```

---

## EvaluateBulkOperationAsync

### Step 1 — Apply RowsAffected threshold
```csharp
var query = baseQuery.Where(x =>
    x.RowsAffected.HasValue &&
    x.RowsAffected.Value >= rule.ThresholdCount);
```
Only events where `RowsAffected` is not null AND meets the threshold qualify.

### Step 2 — Apply EventType filter if rule has one
If `rule.EventType.HasValue` narrow to that type.
If null, do not restrict by event type — any event with enough rows qualifies.

```csharp
if (rule.EventType.HasValue)
    query = query.Where(x => x.EventType == rule.EventType.Value);
```

### Step 3 — Projection
```csharp
var events = await query
    .Select(x => new
    {
        x.Id,
        x.ActorUser,
        x.ActorIp,
        x.EventTime,
        x.EventType,
        x.RowsAffected,
        x.ObjectName,
        x.DatabaseId,
        x.ServerId
    })
    .ToListAsync();
```

### Step 4 — Build one AlertCandidate per event

| AlertCandidate field | Value |
|---|---|
| TriggeringEventId | `x.Id` |
| Title | `$"{rule.Name} — bulk operation detected"` truncated to `DataSentinelConsts.AlertTitleMaxLength` |
| Summary | `$"{x.ActorUser ?? "unknown"} affected {x.RowsAffected} rows on {x.ObjectName ?? "unknown object"} at {x.EventTime:yyyy-MM-dd HH:mm} UTC"` truncated to `DataSentinelConsts.AlertSummaryMaxLength` |
| PrimaryActorUser | `x.ActorUser` |
| PrimaryActorIp | `x.ActorIp` |
| EventTimeStart | `x.EventTime` |
| EventTimeEnd | `x.EventTime` |
| RelatedEventCount | `1` |
| DatabaseId | `x.DatabaseId` |
| ServerId | `x.ServerId` |
| EvidenceSummaryJson | null |

---

## Checklist before marking Skill 4 complete
- [ ] `EvaluateBulkOperationAsync` stub is fully replaced
- [ ] Threshold is applied to `RowsAffected` NOT to a count of events
- [ ] `RowsAffected` null check is present before the threshold comparison
- [ ] `singleEventId` narrowing pattern is applied (same as Skill 3)
- [ ] `Clock.Now` used for the background catch-up window start
- [ ] All Title/Summary strings go through `Truncate()`
- [ ] One candidate produced per matching event
- [ ] Skills 2 and 3 evaluators are untouched
- [ ] Project compiles with no errors