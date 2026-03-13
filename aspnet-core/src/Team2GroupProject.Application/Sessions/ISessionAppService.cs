using System.Threading.Tasks;
using Abp.Application.Services;
using Team2GroupProject.Sessions.Dto;

namespace Team2GroupProject.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
    }
}
