# Skill 2 — ThresholdBased and RepeatedFailure Evaluators

## Prerequisite
Skill 1 must be complete and compiling before this skill is started.

## What this skill does
Replace the two stub bodies in `RulesetEngineAppService`:
- `EvaluateThresholdBasedAsync`
- `EvaluateRepeatedFailureAsync`

No new files. All changes are inside `RulesetEngineAppService.cs`.

---

## Shared query setup — applies to BOTH evaluators

### Window calculation
```
var windowStart = Clock.Now.AddMinutes(-rule.WindowMinutes);
var windowEnd   = Clock.Now;
```
Always use `Clock.Now` — never `DateTime.UtcNow`. The core module sets
`Clock.Provider = ClockProviders.Utc` so they are equivalent, but `Clock.Now`
is the ABP-correct form used everywhere else in the project.

### Base query
```csharp
var query = _activityEventRepository.GetAll()
    .Where(x => x.TenantId == tenantId && x.EventTime >= windowStart);
```
Always filter by `TenantId` first — same pattern as every other service.

### Single-event scope (singleEventId parameter)
When `singleEventId` is not null, the evaluator is being called from
`EvaluateForEventAsync`. The evaluator must still run its full window query
— do NOT narrow to just that one event. The reason: threshold and repeated-failure
rules fire based on a COUNT over a window. The single event is simply the trigger
that caused the evaluation to run; the count still needs the full window.

---

## EvaluateThresholdBasedAsync

### Purpose
Fires when the count of matching events in the rolling window meets or exceeds
`rule.ThresholdCount`, optionally grouped by a field.

### Step 1 — Apply EventType filter if rule has one
```csharp
if (rule.EventType.HasValue)
    query = query.Where(x => x.EventType == rule.EventType.Value);
```

### Step 2 — Group and threshold check
`rule.GroupByField` determines how events are partitioned. The field is nullable
— when null the rule evaluates the global count (no grouping).

Build a LINQ group-by that produces a list of candidates.
Each group that has `Count >= rule.ThresholdCount` becomes one AlertCandidate.

GroupByField cases:

| GroupByField | Group key expression |
|---|---|
| ActorUser | `x.ActorUser` |
| ActorIp | `x.ActorIp` |
| DatabaseId | `x.DatabaseId.ToString()` |
| ObjectName | `x.ObjectName` |
| null (no grouping) | treat entire result set as one group |

For grouped cases, use `.GroupBy(x => <key>).Where(g => g.Count() >= rule.ThresholdCount)`.
For the null case, get the total count and if it meets threshold produce one candidate.

### Step 3 — Build AlertCandidate per group
For each group that fires:

| AlertCandidate field | Value |
|---|---|
| TriggeringEventId | null (aggregate rule) |
| Title | `$"{rule.Name} — threshold exceeded"` truncated to `DataSentinelConsts.AlertTitleMaxLength` |
| Summary | `$"{groupCount} {rule.EventType?.ToString() ?? "events"} by {groupKey ?? "all actors"} in {rule.WindowMinutes} minutes"` truncated to `DataSentinelConsts.AlertSummaryMaxLength` |
| PrimaryActorUser | group key if GroupByField == ActorUser, else most frequent ActorUser in group |
| PrimaryActorIp | group key if GroupByField == ActorIp, else null |
| EventTimeStart | windowStart |
| EventTimeEnd | windowEnd |
| RelatedEventCount | group count |
| DatabaseId | group key parsed as Guid if GroupByField == DatabaseId, else null |
| ServerId | null |
| EvidenceSummaryJson | null (populated in later skills if needed) |

### Important
Do not call `.ToList()` on the full query before grouping.
Push the GroupBy into the database — keep it as IQueryable until `.ToListAsync()`.

---

## EvaluateRepeatedFailureAsync

### Purpose
Fires when the same actor accumulates N failed events within the window.
This rule always looks at `IsSuccess == false`.
It always groups — either by `ActorUser` or `ActorIp` based on `rule.GroupByField`.
If `GroupByField` is null, default to grouping by `ActorUser`.

### Step 1 — Base filter
```csharp
query = query.Where(x => !x.IsSuccess);
```
Also apply EventType filter if `rule.EventType.HasValue` — same pattern as ThresholdBased.

### Step 2 — Group by actor field
```csharp
var groupField = rule.GroupByField ?? AlertRuleGroupByField.ActorUser;
```
Then branch on `groupField`:
- `ActorUser` → group by `x.ActorUser`
- `ActorIp`   → group by `x.ActorIp`
- Any other value → group by `x.ActorUser` (safe fallback)

### Step 3 — Threshold check and candidates
Same pattern as ThresholdBased grouped case.
Groups where `Count >= rule.ThresholdCount` become candidates.

For each candidate:

| AlertCandidate field | Value |
|---|---|
| TriggeringEventId | null |
| Title | `$"{rule.Name} — repeated failures detected"` truncated to `DataSentinelConsts.AlertTitleMaxLength` |
| Summary | `$"{groupCount} failed attempts by {groupKey} in {rule.WindowMinutes} minutes"` truncated to `DataSentinelConsts.AlertSummaryMaxLength` |
| PrimaryActorUser | group key if grouped by ActorUser, else null |
| PrimaryActorIp | group key if grouped by ActorIp, else null |
| EventTimeStart | windowStart |
| EventTimeEnd | windowEnd |
| RelatedEventCount | group count |
| DatabaseId | null |
| ServerId | null |
| EvidenceSummaryJson | null |

---

## String truncation helper
Both evaluators need to truncate Title and Summary before writing them to a candidate.
Add this private static method to the service:

```csharp
private static string Truncate(string value, int maxLength)
{
    if (string.IsNullOrWhiteSpace(value))
        return value;
    return value.Length <= maxLength ? value : value.Substring(0, maxLength);
}
```

Use `Truncate(title, DataSentinelConsts.AlertTitleMaxLength)` and
`Truncate(summary, DataSentinelConsts.AlertSummaryMaxLength)` on every candidate.

---

## Checklist before marking Skill 2 complete
- [ ] `EvaluateThresholdBasedAsync` stub is fully replaced — no longer returns empty list
- [ ] `EvaluateRepeatedFailureAsync` stub is fully replaced — no longer returns empty list
- [ ] Both methods use `Clock.Now` not `DateTime.UtcNow`
- [ ] Both methods filter `TenantId` on the base query
- [ ] All LINQ GroupBy stays as IQueryable until `.ToListAsync()`
- [ ] `Truncate` helper added and used on all Title/Summary assignments
- [ ] `singleEventId` parameter is accepted but does NOT narrow the window query
- [ ] Skill 1 stubs for OutOfHours, PrivilegedAction, BulkOperation are still returning empty lists
- [ ] Project compiles with no errors