using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.Authorization.Accounts.Dto;

namespace Team2GroupProject.Authorization.Accounts
{
    public interface IAccountAppService : IApplicationService
    {
        Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

        Task<RegisterOutput> Register(RegisterInput input);
    }
}
