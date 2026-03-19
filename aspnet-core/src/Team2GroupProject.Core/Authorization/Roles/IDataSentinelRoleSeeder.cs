using System.Threading.Tasks;

namespace Team2GroupProject.Authorization.Roles
{
    /// <summary>
    /// Seeds DataSentinel persona roles for a tenant.
    /// </summary>
    public interface IDataSentinelRoleSeeder
    {
        /// <summary>
        /// Creates or updates DataSentinel persona roles and grants their permission bundles.
        /// </summary>
        /// <param name="tenantId">Tenant identifier.</param>
        Task SeedAsync(int tenantId);
    }
}
