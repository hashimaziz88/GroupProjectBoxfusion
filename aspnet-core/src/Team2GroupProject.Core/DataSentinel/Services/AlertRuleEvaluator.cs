using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Services
{
    public class AlertRuleEvaluator : IAlertRuleEvaluator
    {
        public IReadOnlyCollection<AlertCandidate> Evaluate(
            IReadOnlyCollection<AlertRule> rules,
            IReadOnlyCollection<ActivityEvent> events,
            IReadOnlyCollection<long> focusEventIds)
        {
            var focusSet = focusEventIds.ToHashSet();
            var results = new List<AlertCandidate>();

            foreach (var rule in rules.Where(x => x.IsEnabled))
            {
                results.AddRange(EvaluateRule(rule, events, focusSet));
            }

            return results;
        }

        private IEnumerable<AlertCandidate> EvaluateRule(
            AlertRule rule,
            IReadOnlyCollection<ActivityEvent> events,
            IReadOnlySet<long> focusEventIds)
        {
            return rule.RuleType switch
            {
                AlertRuleType.RepeatedFailedLogins => EvaluateGroupedThresholdRule(
                    rule,
                    events,
                    focusEventIds,
                    activityEvent => activityEvent.EventType == ActivityEventType.Login && !activityEvent.IsSuccessful,
                    "Repeated failed logins detected",
                    "failed login attempts"),
                AlertRuleType.OutOfHoursPrivilegedAction => EvaluateGroupedThresholdRule(
                    rule,
                    events,
                    focusEventIds,
                    activityEvent => activityEvent.IsOutOfHours && activityEvent.IsPrivilegedAction,
                    "Out-of-hours privileged activity detected",
                    "privileged actions outside business hours"),
                AlertRuleType.ExcessiveWriteSpike => EvaluateGroupedThresholdRule(
                    rule,
                    events,
                    focusEventIds,
                    activityEvent => activityEvent.EventType == ActivityEventType.DataWrite,
                    "Write spike detected",
                    "write events"),
                AlertRuleType.LargeRead => EvaluateLargeReadRule(rule, events, focusEventIds),
                AlertRuleType.SuspiciousAccessPattern => EvaluateGroupedThresholdRule(
                    rule,
                    events,
                    focusEventIds,
                    activityEvent => !activityEvent.IsSuccessful || activityEvent.IsPrivilegedAction || activityEvent.Severity >= AlertSeverity.High,
                    "Suspicious access pattern detected",
                    "risky access events"),
                _ => Array.Empty<AlertCandidate>()
            };
        }

        private IEnumerable<AlertCandidate> EvaluateGroupedThresholdRule(
            AlertRule rule,
            IReadOnlyCollection<ActivityEvent> events,
            IReadOnlySet<long> focusEventIds,
            Func<ActivityEvent, bool> predicate,
            string titlePrefix,
            string summaryLabel)
        {
            var candidates = new List<AlertCandidate>();
            var emittedSignatures = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var matchingEvents = events
                .Where(predicate)
                .OrderBy(activityEvent => activityEvent.EventTime)
                .ToList();

            var groupedEvents = matchingEvents
                .GroupBy(activityEvent => ResolveGroupValue(rule.GroupByField, activityEvent))
                .Where(group => !string.IsNullOrWhiteSpace(group.Key));

            foreach (var group in groupedEvents)
            {
                var orderedGroup = group.OrderBy(activityEvent => activityEvent.EventTime).ToList();
                var focusEvents = orderedGroup.Where(activityEvent => focusEventIds.Contains(activityEvent.Id));

                foreach (var focusEvent in focusEvents)
                {
                    var windowStart = focusEvent.EventTime.AddMinutes(-rule.WindowMinutes);
                    var windowEvents = orderedGroup
                        .Where(activityEvent => activityEvent.EventTime >= windowStart && activityEvent.EventTime <= focusEvent.EventTime)
                        .ToList();

                    if (windowEvents.Count < rule.ThresholdCount)
                    {
                        continue;
                    }

                    var signature = $"{rule.Id}:{group.Key}:{windowEvents.First().Id}:{windowEvents.Last().Id}";
                    if (!emittedSignatures.Add(signature))
                    {
                        continue;
                    }

                    candidates.Add(CreateCandidate(rule, windowEvents, $"{titlePrefix} for {group.Key}",
                        $"{windowEvents.Count} {summaryLabel} were observed for {group.Key} within {rule.WindowMinutes} minutes."));
                }
            }

            return candidates;
        }

        private IEnumerable<AlertCandidate> EvaluateLargeReadRule(
            AlertRule rule,
            IReadOnlyCollection<ActivityEvent> events,
            IReadOnlySet<long> focusEventIds)
        {
            var matchingEvents = events
                .Where(activityEvent =>
                    activityEvent.EventType == ActivityEventType.DataRead &&
                    (activityEvent.RowsAffected ?? 0) >= rule.ThresholdCount &&
                    focusEventIds.Contains(activityEvent.Id));

            foreach (var activityEvent in matchingEvents)
            {
                yield return CreateCandidate(
                    rule,
                    new[] { activityEvent },
                    $"Large read detected on {activityEvent.ObjectName}",
                    $"{activityEvent.ActorUser} read {(activityEvent.RowsAffected ?? 0)} rows from {activityEvent.ObjectName} in a single operation.");
            }
        }

        private static AlertCandidate CreateCandidate(
            AlertRule rule,
            IReadOnlyCollection<ActivityEvent> events,
            string title,
            string summary)
        {
            var orderedEvents = events.OrderBy(activityEvent => activityEvent.EventTime).ToList();
            var primaryActorUser = orderedEvents
                .GroupBy(activityEvent => activityEvent.ActorUser)
                .OrderByDescending(group => group.Count())
                .Select(group => group.Key)
                .FirstOrDefault();

            var primaryActorIp = orderedEvents
                .GroupBy(activityEvent => activityEvent.ActorIp)
                .OrderByDescending(group => group.Count())
                .Select(group => group.Key)
                .FirstOrDefault();

            var evidence = orderedEvents
                .Take(5)
                .Select(activityEvent => new
                {
                    activityEvent.Id,
                    activityEvent.EventType,
                    activityEvent.ActorUser,
                    activityEvent.ActorIp,
                    activityEvent.ObjectName,
                    activityEvent.Operation,
                    activityEvent.RowsAffected,
                    activityEvent.EventTime
                });

            return new AlertCandidate
            {
                RuleId = rule.Id,
                Severity = rule.Severity,
                Title = title,
                Summary = summary,
                PrimaryActorUser = primaryActorUser,
                PrimaryActorIp = primaryActorIp,
                EventTimeStart = orderedEvents.First().EventTime,
                EventTimeEnd = orderedEvents.Last().EventTime,
                RelatedEventCount = orderedEvents.Count,
                TopEvidenceJson = JsonSerializer.Serialize(evidence)
            };
        }

        private static string ResolveGroupValue(string groupByField, ActivityEvent activityEvent)
        {
            return groupByField switch
            {
                "ActorIp" => activityEvent.ActorIp,
                "ObjectName" => activityEvent.ObjectName,
                "Operation" => activityEvent.Operation,
                _ => activityEvent.ActorUser
            };
        }
    }
}
