using System;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class AlertStatusHistoryDto
    {
        public Guid Id { get; set; }

        public Guid AlertId { get; set; }

        public SecurityAlertStatus FromStatus { get; set; }

        public SecurityAlertStatus ToStatus { get; set; }

        public string Comment { get; set; }

        public DateTime CreationTime { get; set; }

        public long? CreatorUserId { get; set; }
    }
}
