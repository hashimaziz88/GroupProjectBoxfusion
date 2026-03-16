using System;
using Shouldly;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.DataSentinel.Enums;
using Team2GroupProject.DataSentinel.Services;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel
{
    public class ActivityEventNormalizationManager_Tests
    {
        private readonly ActivityEventNormalizationManager _normalizationManager;

        public ActivityEventNormalizationManager_Tests()
        {
            _normalizationManager = new ActivityEventNormalizationManager();
        }

        [Fact]
        public void Should_normalize_activity_event_and_redact_sensitive_evidence()
        {
            var activityEvent = new ActivityEvent
            {
                EventTime = new DateTime(2026, 3, 16, 2, 15, 0, DateTimeKind.Unspecified),
                EventType = ActivityEventType.Unknown,
                ActorUser = "  analyst.jade  ",
                ActorIp = " 10.10.4.18 ",
                ObjectName = " audit_entries ",
                Operation = " select ",
                DurationMs = -40,
                RowsAffected = -5,
                EvidenceJson = "{\"password\":\"super-secret\",\"token\":\"abc123\"}"
            };

            var normalized = _normalizationManager.Normalize(activityEvent);

            normalized.EventTime.Kind.ShouldBe(DateTimeKind.Utc);
            normalized.IsOutOfHours.ShouldBeTrue();
            normalized.EventType.ShouldBe(ActivityEventType.DataRead);
            normalized.DurationMs.ShouldBe(0);
            normalized.RowsAffected.ShouldBe(0);
            normalized.ActorUser.ShouldBe("analyst.jade");
            normalized.ActorIp.ShouldBe("10.10.4.18");
            normalized.EvidenceJson.ShouldContain("[REDACTED]");
            normalized.EvidenceJson.ShouldNotContain("super-secret");
            normalized.EvidenceJson.ShouldNotContain("abc123");
        }
    }
}
