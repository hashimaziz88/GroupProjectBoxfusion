using System.Threading.Tasks;
using Team2GroupProject.Configuration.Dto;

namespace Team2GroupProject.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}
