using Abp.Application.Services;
using Team2GroupProject.MultiTenancy.Dto;

namespace Team2GroupProject.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

