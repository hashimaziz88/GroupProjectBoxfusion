using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Threading.BackgroundWorkers;
using Abp.Threading.Timers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Team2GroupProject.MultiTenancy;

namespace Team2GroupProject.DataSentinel.RulesetEngine
{
    public class RulesetEngineBackgroundWorker : AsyncPeriodicBackgroundWorkerBase
    {
        public RulesetEngineBackgroundWorker(
            AbpTimer timer,
            IIocResolver iocResolver)
            : base(timer, iocResolver)
        {
            timer.Period = 5 * 60 * 1000;
        }

        protected override async Task DoWorkAsync(PeriodicBackgroundWorkerContext workerContext)
        {
            var tenantManager = workerContext.ServiceProvider.GetRequiredService<TenantManager>();

            var tenants = await tenantManager.Tenants
                .Where(t => t.IsActive)
                .ToListAsync();

            var engineServiceType = Type.GetType("Team2GroupProject.DataSentinel.RulesetEngine.IRulesetEngineAppService, Team2GroupProject.Application");
            if (engineServiceType == null)
            {
                return;
            }

            var engineService = workerContext.ServiceProvider.GetRequiredService(engineServiceType);
            var evaluateAllRulesMethod = engineServiceType.GetMethod("EvaluateAllRulesAsync");

            if (evaluateAllRulesMethod == null)
            {
                return;
            }

            foreach (var tenant in tenants)
            {
                var evaluationTask = (Task)evaluateAllRulesMethod.Invoke(engineService, new object[] { tenant.Id });
                await evaluationTask;
            }
        }
    }
}
