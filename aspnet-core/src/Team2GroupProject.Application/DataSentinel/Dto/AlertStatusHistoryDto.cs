using System;
using Team2GroupProject.DataSentinel.Enums;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class AlertStatusHistoryDto
    {
        public long Id { get; set; }

        public DateTime ChangedAt { get; set; }

        public long? ChangedByUserId { get; set; }

        public string ChangedByName { get; set; }

        public SecurityAlertStatus FromStatus { get; set; }

        public SecurityAlertStatus ToStatus { get; set; }

        public string Comment { get; set; }
    }
}
