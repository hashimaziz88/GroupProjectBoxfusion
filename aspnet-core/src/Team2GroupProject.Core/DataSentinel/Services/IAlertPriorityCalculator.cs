using System.Collections.Generic;
using Abp.Dependency;
using Team2GroupProject.DataSentinel.Detection;

namespace Team2GroupProject.DataSentinel.Services
{
    public interface IAlertPriorityCalculator : ITransientDependency
    {
        void ApplyPriorityRules(IList<AlertCandidate> candidates);
    }
}
