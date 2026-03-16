using System;
using Abp.Application.Services.Dto;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class GetActivityEventsInput : PagedResultRequestDto
    {
        public string Keyword { get; set; }

        public long? ServerId { get; set; }

        public long? DatabaseId { get; set; }

        public ActivityEventType? EventType { get; set; }

        public AlertSeverity? Severity { get; set; }

        public bool? IsSuccessful { get; set; }

        public bool? IsOutOfHours { get; set; }

        public DateTime? DateFromUtc { get; set; }

        public DateTime? DateToUtc { get; set; }
    }
}
