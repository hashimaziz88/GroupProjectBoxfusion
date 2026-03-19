using System.Threading.Tasks;

namespace Team2GroupProject.DataSentinel.AlertRules
{
    public interface IDefaultAlertRuleSeeder
    {
        Task<int> EnsureSeededAsync(int tenantId);
    }
}
