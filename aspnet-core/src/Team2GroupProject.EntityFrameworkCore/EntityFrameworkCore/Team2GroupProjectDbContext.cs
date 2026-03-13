using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.MultiTenancy;

namespace Team2GroupProject.EntityFrameworkCore
{
    public class Team2GroupProjectDbContext : AbpZeroDbContext<Tenant, Role, User, Team2GroupProjectDbContext>
    {
        /* Define a DbSet for each entity of the application */
        
        public Team2GroupProjectDbContext(DbContextOptions<Team2GroupProjectDbContext> options)
            : base(options)
        {
        }
    }
}
