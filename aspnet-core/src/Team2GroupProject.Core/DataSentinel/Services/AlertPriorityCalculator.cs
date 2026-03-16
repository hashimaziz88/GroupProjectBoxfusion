using System;
using System.Collections.Generic;
using System.Linq;
using Team2GroupProject.DataSentinel.Detection;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Services
{
    public class AlertPriorityCalculator : IAlertPriorityCalculator
    {
        public void ApplyPriorityRules(IList<AlertCandidate> candidates)
        {
            foreach (var candidate in candidates)
            {
                var overlapCount = candidates.Count(other =>
                    !ReferenceEquals(other, candidate) &&
                    HasSharedActor(candidate, other) &&
                    WindowsOverlap(candidate, other));

                if (overlapCount > 0)
                {
                    candidate.Severity = Elevate(candidate.Severity);
                }
            }
        }

        private static bool HasSharedActor(AlertCandidate left, AlertCandidate right)
        {
            if (!string.IsNullOrWhiteSpace(left.PrimaryActorUser) &&
                string.Equals(left.PrimaryActorUser, right.PrimaryActorUser, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return !string.IsNullOrWhiteSpace(left.PrimaryActorIp) &&
                   string.Equals(left.PrimaryActorIp, right.PrimaryActorIp, StringComparison.OrdinalIgnoreCase);
        }

        private static bool WindowsOverlap(AlertCandidate left, AlertCandidate right)
        {
            return left.EventTimeStart <= right.EventTimeEnd && right.EventTimeStart <= left.EventTimeEnd;
        }

        private static AlertSeverity Elevate(AlertSeverity severity)
        {
            return severity >= AlertSeverity.Critical
                ? AlertSeverity.Critical
                : severity + 1;
        }
    }
}
