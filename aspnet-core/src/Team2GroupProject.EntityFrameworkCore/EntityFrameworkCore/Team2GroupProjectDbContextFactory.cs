using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Team2GroupProject.Configuration;
using Team2GroupProject.Web;

namespace Team2GroupProject.EntityFrameworkCore
{
    /* This class is needed to run "dotnet ef ..." commands from command line on development. Not used anywhere else */
    public class Team2GroupProjectDbContextFactory : IDesignTimeDbContextFactory<Team2GroupProjectDbContext>
    {
        public Team2GroupProjectDbContext CreateDbContext(string[] args)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            AppContext.SetSwitch("Npgsql.DisableDateTimeInfinityConversions", true);
            var builder = new DbContextOptionsBuilder<Team2GroupProjectDbContext>();
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var addUserSecrets = string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase);

            /*
             You can provide an environmentName parameter to the AppConfigurations.Get method. 
             In this case, AppConfigurations will try to read appsettings.{environmentName}.json.
             Use Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") method or from string[] args to get environment if necessary.
             https://docs.microsoft.com/en-us/ef/core/cli/dbcontext-creation?tabs=dotnet-core-cli#args
             */
            var configuration = AppConfigurations.Get(
                WebContentDirectoryFinder.CalculateContentRootFolder(),
                environmentName,
                addUserSecrets
            );

            Team2GroupProjectDbContextConfigurer.Configure(
                builder,
                configuration.GetConnectionString(Team2GroupProjectConsts.ConnectionStringName)
            );

            return new Team2GroupProjectDbContext(builder.Options);
        }
    }
}
