using Abp.Authorization;
using Team2GroupProject.Authorization.Roles;
using Team2GroupProject.Authorization.Users;

namespace Team2GroupProject.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}
