using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace Team2GroupProject.Localization
{
    public static class Team2GroupProjectLocalizationConfigurer
    {
        public static void Configure(ILocalizationConfiguration localizationConfiguration)
        {
            localizationConfiguration.Sources.Add(
                new DictionaryBasedLocalizationSource(Team2GroupProjectConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        typeof(Team2GroupProjectLocalizationConfigurer).GetAssembly(),
                        "Team2GroupProject.Localization.SourceFiles"
                    )
                )
            );
        }
    }
}
