using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Team2GroupProject.EntityFrameworkCore;
using Team2GroupProject.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace Team2GroupProject.Web.Tests
{
    [DependsOn(
        typeof(Team2GroupProjectWebMvcModule),
        typeof(AbpAspNetCoreTestBaseModule)
    )]
    public class Team2GroupProjectWebTestModule : AbpModule
    {
        public Team2GroupProjectWebTestModule(Team2GroupProjectEntityFrameworkModule abpProjectNameEntityFrameworkModule)
        {
            abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
        } 
        
        public override void PreInitialize()
        {
            Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(Team2GroupProjectWebTestModule).GetAssembly());
        }
        
        public override void PostInitialize()
        {
            IocManager.Resolve<ApplicationPartManager>()
                .AddApplicationPartsIfNotAddedBefore(typeof(Team2GroupProjectWebMvcModule).Assembly);
        }
    }
}