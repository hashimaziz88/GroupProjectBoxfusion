using Abp.Zero.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel;
using Team2GroupProject.MultiTenancy;

namespace Team2GroupProject.EntityFrameworkCore
{
    public class Team2GroupProjectDbContext : AbpZeroDbContext<Tenant, Role, User, Team2GroupProjectDbContext>
    {
        public DbSet<MonitoredServer> MonitoredServers { get; set; }

        public DbSet<MonitoredDatabase> MonitoredDatabases { get; set; }

        public DbSet<ActivityEvent> ActivityEvents { get; set; }

        public DbSet<AlertRule> AlertRules { get; set; }

        public DbSet<SecurityAlert> SecurityAlerts { get; set; }

        public DbSet<IncidentNote> IncidentNotes { get; set; }

        public DbSet<AlertStatusHistory> AlertStatusHistories { get; set; }

        public DbSet<AlertStatusHistory> AlertStatusHistory => AlertStatusHistories;

        public Team2GroupProjectDbContext(DbContextOptions<Team2GroupProjectDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(Team2GroupProjectDbContext).Assembly);
        }
    }
}
