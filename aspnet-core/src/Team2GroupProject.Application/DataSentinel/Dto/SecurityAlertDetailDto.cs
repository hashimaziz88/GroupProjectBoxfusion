using System.Collections.Generic;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class SecurityAlertDetailDto : SecurityAlertListDto
    {
        public long RuleId { get; set; }

        public string RuleDescription { get; set; }

        public string TopEvidenceJson { get; set; }

        public List<IncidentNoteDto> Notes { get; set; } = new List<IncidentNoteDto>();

        public List<AlertStatusHistoryDto> StatusHistory { get; set; } = new List<AlertStatusHistoryDto>();

        public List<SecurityAlertRelatedEventDto> RelatedEvents { get; set; } = new List<SecurityAlertRelatedEventDto>();
    }
}
