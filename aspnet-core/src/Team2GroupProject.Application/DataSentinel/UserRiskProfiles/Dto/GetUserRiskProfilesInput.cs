using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class GetUserRiskProfilesInput : PagedResultRequestDto
    {
        public string Keyword { get; set; }
        public UserRiskLevel? RiskLevel { get; set; }
        public int? MinRiskScore { get; set; }
        public int? MaxRiskScore { get; set; }
    }
}
