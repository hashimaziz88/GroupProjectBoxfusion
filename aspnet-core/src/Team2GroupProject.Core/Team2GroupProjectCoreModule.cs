using Abp.Localization;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Runtime.Security;
using Abp.Timing;
using Abp.Zero;
using Abp.Zero.Configuration;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.Configuration;
using Team2GroupProject.Localization;
using Team2GroupProject.MultiTenancy;
using Team2GroupProject.Timing;

namespace Team2GroupProject
{
    [DependsOn(typeof(AbpZeroCoreModule))]
    public class Team2GroupProjectCoreModule : AbpModule
    {
        public override void PreInitialize()
        {
            Clock.Provider = ClockProviders.Utc;
            Configuration.Auditing.IsEnabledForAnonymousUsers = true;

            // Declare entity types
            Configuration.Modules.Zero().EntityTypes.Tenant = typeof(Tenant);
            Configuration.Modules.Zero().EntityTypes.Role = typeof(Role);
            Configuration.Modules.Zero().EntityTypes.User = typeof(User);

            Team2GroupProjectLocalizationConfigurer.Configure(Configuration.Localization);

            // Enable this line to create a multi-tenant application.
            Configuration.MultiTenancy.IsEnabled = Team2GroupProjectConsts.MultiTenancyEnabled;

            // Configure roles
            AppRoleConfig.Configure(Configuration.Modules.Zero().RoleManagement);

            Configuration.Settings.Providers.Add<AppSettingProvider>();
            
            Configuration.Localization.Languages.Add(new LanguageInfo("fa", "فارسی", "famfamfam-flags ir"));
            
            Configuration.Settings.SettingEncryptionConfiguration.DefaultPassPhrase = Team2GroupProjectConsts.DefaultPassPhrase;
            SimpleStringCipher.DefaultPassPhrase = Team2GroupProjectConsts.DefaultPassPhrase;
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(Team2GroupProjectCoreModule).GetAssembly());
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<AppTimes>().StartupTime = Clock.Now;
        }
    }
}
