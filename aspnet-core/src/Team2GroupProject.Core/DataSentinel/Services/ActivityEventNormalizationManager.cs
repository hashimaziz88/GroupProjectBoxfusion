using System;
using System.Text.RegularExpressions;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Services
{
    public class ActivityEventNormalizationManager : IActivityEventNormalizationManager
    {
        private static readonly Regex SensitiveFieldRegex = new Regex(
            "(?i)(\"(?:password|token|secret|apikey|connectionstring)\"\\s*:\\s*\")[^\"]*(\")",
            RegexOptions.Compiled);

        public ActivityEvent Normalize(ActivityEvent activityEvent)
        {
            activityEvent.ActorUser = NormalizeText(activityEvent.ActorUser, ActivityEvent.MaxActorUserLength, "unknown");
            activityEvent.ActorIp = NormalizeText(activityEvent.ActorIp, ActivityEvent.MaxActorIpLength, "0.0.0.0");
            activityEvent.ObjectName = NormalizeText(activityEvent.ObjectName, ActivityEvent.MaxObjectNameLength, "unspecified");
            activityEvent.Operation = NormalizeText(activityEvent.Operation, ActivityEvent.MaxOperationLength, "UNKNOWN")?.ToUpperInvariant();
            activityEvent.QuerySignature = NormalizeText(activityEvent.QuerySignature, ActivityEvent.MaxQuerySignatureLength, null);
            activityEvent.FailureReason = NormalizeText(activityEvent.FailureReason, ActivityEvent.MaxFailureReasonLength, null);
            activityEvent.EvidenceJson = SanitizeEvidenceJson(activityEvent.EvidenceJson);
            activityEvent.EventTime = NormalizeEventTime(activityEvent.EventTime);
            activityEvent.DurationMs = Math.Max(activityEvent.DurationMs, 0);
            activityEvent.RowsAffected = activityEvent.RowsAffected.HasValue
                ? Math.Max(activityEvent.RowsAffected.Value, 0)
                : null;
            activityEvent.IsOutOfHours = IsOutOfHours(activityEvent.EventTime);
            activityEvent.IsPrivilegedAction = activityEvent.IsPrivilegedAction || IsPrivilegedOperation(activityEvent);

            if (activityEvent.EventType == ActivityEventType.Unknown)
            {
                activityEvent.EventType = InferEventType(activityEvent.Operation, activityEvent.IsPrivilegedAction);
            }

            if (activityEvent.Severity == AlertSeverity.Informational)
            {
                activityEvent.Severity = InferSeverity(activityEvent);
            }

            return activityEvent;
        }

        private static string NormalizeText(string value, int maxLength, string fallback)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return fallback;
            }

            var trimmed = value.Trim();
            return trimmed.Length <= maxLength
                ? trimmed
                : trimmed.Substring(0, maxLength);
        }

        private static DateTime NormalizeEventTime(DateTime eventTime)
        {
            if (eventTime == default)
            {
                return DateTime.UtcNow;
            }

            if (eventTime.Kind == DateTimeKind.Unspecified)
            {
                return DateTime.SpecifyKind(eventTime, DateTimeKind.Utc);
            }

            return eventTime.ToUniversalTime();
        }

        private static bool IsOutOfHours(DateTime eventTime)
        {
            var hour = eventTime.Hour;
            return hour < 6 || hour >= 20;
        }

        private static bool IsPrivilegedOperation(ActivityEvent activityEvent)
        {
            if (activityEvent.EventType == ActivityEventType.PrivilegedAction ||
                activityEvent.EventType == ActivityEventType.PermissionChange ||
                activityEvent.EventType == ActivityEventType.SchemaChange)
            {
                return true;
            }

            var operation = activityEvent.Operation ?? string.Empty;
            return operation.Contains("ALTER", StringComparison.OrdinalIgnoreCase) ||
                   operation.Contains("DROP", StringComparison.OrdinalIgnoreCase) ||
                   operation.Contains("GRANT", StringComparison.OrdinalIgnoreCase) ||
                   operation.Contains("REVOKE", StringComparison.OrdinalIgnoreCase) ||
                   operation.Contains("TRUNCATE", StringComparison.OrdinalIgnoreCase) ||
                   operation.Contains("ROLE", StringComparison.OrdinalIgnoreCase);
        }

        private static ActivityEventType InferEventType(string operation, bool isPrivilegedAction)
        {
            if (isPrivilegedAction)
            {
                return ActivityEventType.PrivilegedAction;
            }

            if (string.IsNullOrWhiteSpace(operation))
            {
                return ActivityEventType.Query;
            }

            if (operation.Contains("LOGIN", StringComparison.OrdinalIgnoreCase))
            {
                return ActivityEventType.Login;
            }

            if (operation.Contains("SELECT", StringComparison.OrdinalIgnoreCase))
            {
                return ActivityEventType.DataRead;
            }

            if (operation.Contains("INSERT", StringComparison.OrdinalIgnoreCase) ||
                operation.Contains("UPDATE", StringComparison.OrdinalIgnoreCase) ||
                operation.Contains("DELETE", StringComparison.OrdinalIgnoreCase) ||
                operation.Contains("MERGE", StringComparison.OrdinalIgnoreCase))
            {
                return ActivityEventType.DataWrite;
            }

            return ActivityEventType.Query;
        }

        private static AlertSeverity InferSeverity(ActivityEvent activityEvent)
        {
            if (!activityEvent.IsSuccessful && activityEvent.EventType == ActivityEventType.Login)
            {
                return AlertSeverity.Medium;
            }

            if (activityEvent.IsPrivilegedAction)
            {
                return AlertSeverity.High;
            }

            if ((activityEvent.RowsAffected ?? 0) >= 5000)
            {
                return AlertSeverity.High;
            }

            return activityEvent.EventType switch
            {
                ActivityEventType.DataWrite => AlertSeverity.Medium,
                ActivityEventType.DataRead => AlertSeverity.Low,
                ActivityEventType.SchemaChange => AlertSeverity.High,
                ActivityEventType.PermissionChange => AlertSeverity.High,
                _ => AlertSeverity.Low
            };
        }

        private static string SanitizeEvidenceJson(string evidenceJson)
        {
            if (string.IsNullOrWhiteSpace(evidenceJson))
            {
                return null;
            }

            return SensitiveFieldRegex.Replace(evidenceJson, "$1[REDACTED]$2");
        }
    }
}
