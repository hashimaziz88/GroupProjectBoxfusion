using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.AlertRules;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Team2GroupProject.DataSentinel.UserRiskProfiles;
using Team2GroupProject.EntityFrameworkCore.DataSentinel.Configurations;
using Team2GroupProject.MultiTenancy;

namespace Team2GroupProject.EntityFrameworkCore
{
    public class Team2GroupProjectDbContext : AbpZeroDbContext<Tenant, Role, User, Team2GroupProjectDbContext>
    {
        public DbSet<MonitoredServer> MonitoredServers { get; set; }

        public DbSet<MonitoredDatabase> MonitoredDatabases { get; set; }

        public DbSet<MonitoredTable> MonitoredTables { get; set; }

        public DbSet<ActivityEvent> ActivityEvents { get; set; }

        public DbSet<AlertRule> AlertRules { get; set; }

        public DbSet<SecurityAlert> SecurityAlerts { get; set; }

        public DbSet<IncidentNote> IncidentNotes { get; set; }

        public DbSet<AlertStatusHistory> AlertStatusHistoryEntries { get; set; }

        public DbSet<UserRiskProfile> UserRiskProfiles { get; set; }

        public Team2GroupProjectDbContext(DbContextOptions<Team2GroupProjectDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new MonitoredServerConfiguration());
            modelBuilder.ApplyConfiguration(new MonitoredDatabaseConfiguration());
            modelBuilder.ApplyConfiguration(new MonitoredTableConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityEventConfiguration());
            modelBuilder.ApplyConfiguration(new AlertRuleConfiguration());
            modelBuilder.ApplyConfiguration(new SecurityAlertConfiguration());
            modelBuilder.ApplyConfiguration(new IncidentNoteConfiguration());
            modelBuilder.ApplyConfiguration(new AlertStatusHistoryConfiguration());
            modelBuilder.ApplyConfiguration(new UserRiskProfileConfiguration());
        }
    }
}
