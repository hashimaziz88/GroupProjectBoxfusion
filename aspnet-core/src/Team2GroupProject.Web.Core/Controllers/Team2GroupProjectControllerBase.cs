using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace Team2GroupProject.Controllers
{
    public abstract class Team2GroupProjectControllerBase: AbpController
    {
        protected Team2GroupProjectControllerBase()
        {
            LocalizationSourceName = Team2GroupProjectConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
