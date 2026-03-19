using System;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class UpdateUserRiskProfileStatusInput
    {
        public Guid ProfileId { get; set; }
        public UserProfileStatus Status { get; set; }
    }
}
