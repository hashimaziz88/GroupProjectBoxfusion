# Skill 1 — Ruleset Engine Shell

## Purpose
Create the folder, interface, internal model, and service shell for the ruleset engine.
No evaluation logic is written yet. All evaluator methods return empty lists.
This skill must compile cleanly before Skill 2 is started.

---

## Folder
All three files go in:
```
src/Team2GroupProject.Application/DataSentinel/RulesetEngine/
```

---

## File 1 — IRulesetEngineAppService.cs

Create the public interface. It must have exactly two methods:

```
EvaluateAllRulesAsync(int tenantId)
```
- Returns `Task`
- Called by the background worker on a schedule (full tenant scan)
- tenantId is passed explicitly because background workers have no AbpSession

```
EvaluateForEventAsync(int tenantId, Guid activityEventId)
```
- Returns `Task`
- Called by ActivityEventAppService immediately after a single event is ingested
- Allows real-time alert creation without waiting for the next scheduled cycle
- Takes the persisted event's ID so the evaluator can load it from the DB

Namespace: `Team2GroupProject.DataSentinel.RulesetEngine`

---

## File 2 — AlertCandidate.cs

Create an `internal` class (never public — it is a hand-off type only between
evaluators and the persistence method inside the same service).

Fields — map directly to SecurityAlert properties so Skill 5 has no translation:

| Field | Type | Purpose |
|---|---|---|
| TriggeringEventId | Guid? | Set for per-event rules, null for aggregate rules |
| Title | string | Written to SecurityAlert.Title |
| Summary | string | Written to SecurityAlert.Summary |
| PrimaryActorUser | string | Written to SecurityAlert.PrimaryActorUser |
| PrimaryActorIp | string | Written to SecurityAlert.PrimaryActorIp |
| EventTimeStart | DateTime | Start of event window (UTC) |
| EventTimeEnd | DateTime | End of event window (UTC) |
| RelatedEventCount | int | Number of events that contributed |
| DatabaseId | Guid? | Scope for the alert |
| ServerId | Guid? | Scope for the alert |
| EvidenceSummaryJson | string | Serialised context snapshot |

Namespace: `Team2GroupProject.DataSentinel.RulesetEngine`

---

## File 3 — RulesetEngineAppService.cs

### Class declaration
- Inherits `Team2GroupProjectAppServiceBase` — never plain `ApplicationService`
- Implements `IRulesetEngineAppService`
- Namespace: `Team2GroupProject.DataSentinel.RulesetEngine`

### Constructor — inject exactly these three repositories
```
IActivityEventRepository  _activityEventRepository
IAlertRuleRepository      _alertRuleRepository
ISecurityAlertRepository  _securityAlertRepository
```
All three are constructor-injected. No property injection.

### Public method: EvaluateAllRulesAsync(int tenantId)
- Annotate with `[DisableAuditing]` — runs on a tight schedule, must not flood audit log
- Calls `_alertRuleRepository.GetAllEnabledAsync(tenantId)` to load rules
- Iterates rules and calls `await EvaluateRuleAsync(tenantId, rule)` for each
- No try/catch — let ABP handle unhandled exceptions at the worker level

### Public method: EvaluateForEventAsync(int tenantId, Guid activityEventId)
- Annotate with `[DisableAuditing]`
- Calls `_alertRuleRepository.GetAllEnabledAsync(tenantId)` to load rules
- Iterates rules and calls `await EvaluateRuleAsync(tenantId, rule, activityEventId)` for each
- The activityEventId is passed down so evaluators can scope their query to that event

### Private method: EvaluateRuleAsync(int tenantId, AlertRule rule, Guid? singleEventId = null)
- Dispatches to the correct evaluator using a switch on `rule.RuleType`
- Switch cases:
  - `AlertRuleType.ThresholdBased`   → `EvaluateThresholdBasedAsync`
  - `AlertRuleType.RepeatedFailure`  → `EvaluateRepeatedFailureAsync`
  - `AlertRuleType.OutOfHours`       → `EvaluateOutOfHoursAsync`
  - `AlertRuleType.PrivilegedAction` → `EvaluatePrivilegedActionAsync`
  - `AlertRuleType.BulkOperation`    → `EvaluateBulkOperationAsync`
  - default                          → `new List<AlertCandidate>()`
- All evaluator methods receive `(int tenantId, AlertRule rule, Guid? singleEventId)`
- After getting candidates, iterate and call `await CreateAlertIfNotDuplicateAsync(tenantId, rule, candidate)`

### Five private evaluator stubs
Each returns `Task<List<AlertCandidate>>`. Body is `Task.FromResult(new List<AlertCandidate>())`.
- `EvaluateThresholdBasedAsync(int tenantId, AlertRule rule, Guid? singleEventId)`
- `EvaluateRepeatedFailureAsync(int tenantId, AlertRule rule, Guid? singleEventId)`
- `EvaluateOutOfHoursAsync(int tenantId, AlertRule rule, Guid? singleEventId)`
- `EvaluatePrivilegedActionAsync(int tenantId, AlertRule rule, Guid? singleEventId)`
- `EvaluateBulkOperationAsync(int tenantId, AlertRule rule, Guid? singleEventId)`

### Persistence stub
```
private Task CreateAlertIfNotDuplicateAsync(int tenantId, AlertRule rule, AlertCandidate candidate)
    => Task.CompletedTask;
```
Replaced entirely in Skill 5.

---

## Checklist before marking Skill 1 complete
- [ ] All three files are in `Application/DataSentinel/RulesetEngine/`
- [ ] `IRulesetEngineAppService` has both `EvaluateAllRulesAsync` and `EvaluateForEventAsync`
- [ ] `AlertCandidate` is `internal`
- [ ] Service inherits `Team2GroupProjectAppServiceBase`
- [ ] Both public methods have `[DisableAuditing]`
- [ ] All evaluator stubs accept `Guid? singleEventId`
- [ ] Project compiles with no errors