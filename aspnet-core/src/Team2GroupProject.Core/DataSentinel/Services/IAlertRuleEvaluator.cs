using System.Collections.Generic;
using Abp.Dependency;
using Team2GroupProject.DataSentinel.Detection;

namespace Team2GroupProject.DataSentinel.Services
{
    public interface IAlertRuleEvaluator : ITransientDependency
    {
        IReadOnlyCollection<AlertCandidate> Evaluate(
            IReadOnlyCollection<AlertRule> rules,
            IReadOnlyCollection<ActivityEvent> events,
            IReadOnlyCollection<long> focusEventIds);
    }
}
