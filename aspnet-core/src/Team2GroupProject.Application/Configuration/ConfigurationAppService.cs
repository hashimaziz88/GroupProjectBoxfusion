using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Team2GroupProject.Configuration.Dto;

namespace Team2GroupProject.Configuration
{
    [AbpAuthorize]
    public class ConfigurationAppService : Team2GroupProjectAppServiceBase, IConfigurationAppService
    {
        public async Task ChangeUiTheme(ChangeUiThemeInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
        }
    }
}
