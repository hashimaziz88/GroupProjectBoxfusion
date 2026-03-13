using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace Team2GroupProject.EntityFrameworkCore
{
    public static class Team2GroupProjectDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<Team2GroupProjectDbContext> builder, string connectionString)
        {
            builder.UseNpgsql(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<Team2GroupProjectDbContext> builder, DbConnection connection)
        {
            builder.UseNpgsql(connection);
        }
    }
}
