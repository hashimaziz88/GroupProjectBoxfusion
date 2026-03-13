using Team2GroupProject.Debugging;

namespace Team2GroupProject
{
    public class Team2GroupProjectConsts
    {
        public const string LocalizationSourceName = "Team2GroupProject";

        public const string ConnectionStringName = "Default";

        public const bool MultiTenancyEnabled = true;


        /// <summary>
        /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
        /// </summary>
        public static readonly string DefaultPassPhrase =
            DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "a52b5f7caa6e41f089dc43410c4b6be3";
    }
}
