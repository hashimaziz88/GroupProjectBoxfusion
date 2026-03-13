using System.Threading.Tasks;
using Team2GroupProject.Models.TokenAuth;
using Team2GroupProject.Web.Controllers;
using Shouldly;
using Xunit;

namespace Team2GroupProject.Web.Tests.Controllers
{
    public class HomeController_Tests: Team2GroupProjectWebTestBase
    {
        [Fact]
        public async Task Index_Test()
        {
            await AuthenticateAsync(null, new AuthenticateModel
            {
                UserNameOrEmailAddress = "admin",
                Password = "123qwe"
            });

            //Act
            var response = await GetResponseAsStringAsync(
                GetUrl<HomeController>(nameof(HomeController.Index))
            );

            //Assert
            response.ShouldNotBeNullOrEmpty();
        }
    }
}