using System;
using Microsoft.Extensions.Configuration;
using Castle.MicroKernel.Registration;
using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Team2GroupProject.Configuration;
using Team2GroupProject.EntityFrameworkCore;
using Team2GroupProject.Migrator.DependencyInjection;

namespace Team2GroupProject.Migrator
{
    [DependsOn(typeof(Team2GroupProjectEntityFrameworkModule))]
    public class Team2GroupProjectMigratorModule : AbpModule
    {
        private readonly IConfigurationRoot _appConfiguration;

        public Team2GroupProjectMigratorModule(Team2GroupProjectEntityFrameworkModule abpProjectNameEntityFrameworkModule)
        {
            abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            _appConfiguration = AppConfigurations.Get(
                typeof(Team2GroupProjectMigratorModule).GetAssembly().GetDirectoryPathOrNull(),
                environmentName,
                string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase)
            );
        }

        public override void PreInitialize()
        {
            Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
                Team2GroupProjectConsts.ConnectionStringName
            );

            Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
            Configuration.ReplaceService(
                typeof(IEventBus), 
                () => IocManager.IocContainer.Register(
                    Component.For<IEventBus>().Instance(NullEventBus.Instance)
                )
            );
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(Team2GroupProjectMigratorModule).GetAssembly());
            ServiceCollectionRegistrar.Register(IocManager);
        }
    }
}
