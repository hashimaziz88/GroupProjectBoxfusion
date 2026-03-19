using System;
using System.Transactions;
using Microsoft.EntityFrameworkCore;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore.Uow;
using Abp.MultiTenancy;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.EntityFrameworkCore.Seed.Host;
using Team2GroupProject.EntityFrameworkCore.Seed.Tenants;

namespace Team2GroupProject.EntityFrameworkCore.Seed
{
    public static class SeedHelper
    {
        public static void SeedHostDb(IIocResolver iocResolver)
        {
            using (var dataSentinelRoleSeeder = iocResolver.ResolveAsDisposable<IDataSentinelRoleSeeder>())
            {
                WithDbContext<Team2GroupProjectDbContext>(
                    iocResolver,
                    context => SeedHostDb(context, dataSentinelRoleSeeder.Object));
            }
        }

        public static void SeedHostDb(Team2GroupProjectDbContext context)
        {
            SeedHostDb(context, null);
        }

        private static void SeedHostDb(Team2GroupProjectDbContext context, IDataSentinelRoleSeeder dataSentinelRoleSeeder)
        {
            context.SuppressAutoSetTenantId = true;

            // Host seed
            new InitialHostDbBuilder(context).Create();

            // Default tenant seed (in host database).
            new DefaultTenantBuilder(context).Create();
            new TenantRoleAndUserBuilder(context, 1, dataSentinelRoleSeeder).Create();
        }

        private static void WithDbContext<TDbContext>(IIocResolver iocResolver, Action<TDbContext> contextAction)
            where TDbContext : DbContext
        {
            using (var uowManager = iocResolver.ResolveAsDisposable<IUnitOfWorkManager>())
            {
                using (var uow = uowManager.Object.Begin(TransactionScopeOption.Suppress))
                {
                    var context = uowManager.Object.Current.GetDbContext<TDbContext>(MultiTenancySides.Host);

                    contextAction(context);

                    uow.Complete();
                }
            }
        }
    }
}
