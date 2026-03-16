using System;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class GetSecurityAlertsInput : PagedResultRequestDto
    {
        public string Keyword { get; set; }

        public AlertSeverity? Severity { get; set; }

        public SecurityAlertStatus? Status { get; set; }

        public string ActorUser { get; set; }

        public long? ServerId { get; set; }

        public long? DatabaseId { get; set; }

        public string ObjectName { get; set; }

        public DateTime? DateFromUtc { get; set; }

        public DateTime? DateToUtc { get; set; }

        public bool? OpenOnly { get; set; }
    }
}
