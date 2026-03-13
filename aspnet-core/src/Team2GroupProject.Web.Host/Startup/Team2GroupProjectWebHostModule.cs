using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Team2GroupProject.Configuration;

namespace Team2GroupProject.Web.Host.Startup
{
    [DependsOn(
       typeof(Team2GroupProjectWebCoreModule))]
    public class Team2GroupProjectWebHostModule: AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public Team2GroupProjectWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(Team2GroupProjectWebHostModule).GetAssembly());
        }
    }
}
