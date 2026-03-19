using Abp.Runtime.Validation;
using Team2GroupProject.DataSentinel.UserRiskProfiles;

namespace Team2GroupProject.DataSentinel.UserRiskProfiles.Dto
{
    public class GetUserRiskProfilesInput : IShouldNormalize
    {
        /// <summary>Free-text search on ActorUser.</summary>
        public string Keyword { get; set; }

        /// <summary>Filter by risk level.</summary>
        public UserRiskLevel? RiskLevel { get; set; }

        /// <summary>Filter by analyst-assigned status.</summary>
        public UserProfileStatus? Status { get; set; }

        /// <summary>Return only profiles with RiskScore >= this value.</summary>
        public int? MinRiskScore { get; set; }

        /// <summary>Return only profiles with RiskScore <= this value.</summary>
        public int? MaxRiskScore { get; set; }

        public int SkipCount { get; set; }

        public int MaxResultCount { get; set; } = 50;

        public void Normalize()
        {
            if (MaxResultCount <= 0 || MaxResultCount > 100)
            {
                MaxResultCount = 50;
            }

            if (SkipCount < 0)
            {
                SkipCount = 0;
            }
        }
    }
}
