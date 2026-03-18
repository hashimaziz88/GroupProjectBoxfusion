using System;
using System.Threading.Tasks;
using Abp.Application.Services;

namespace Team2GroupProject.DataSentinel.RulesetEngine
{
    public interface IRulesetEngineAppService : IApplicationService
    {
        Task EvaluateAllRulesAsync(int tenantId);

        Task EvaluateForEventAsync(int tenantId, Guid activityEventId);
    }
}
