using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Team2GroupProject.Authorization;

namespace Team2GroupProject
{
    [DependsOn(
        typeof(Team2GroupProjectCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class Team2GroupProjectApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<Team2GroupProjectAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(Team2GroupProjectApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
