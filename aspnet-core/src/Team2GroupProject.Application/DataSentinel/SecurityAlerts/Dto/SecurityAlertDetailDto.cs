using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    /// <summary>Full alert details shown in the Alert Details side panel.</summary>
    public class SecurityAlertDetailDto : SecurityAlertDto
    {
        /// <summary>Suggested investigation steps for this alert.</summary>
        public List<string> RecommendedActions { get; set; } = new();
    }
}
