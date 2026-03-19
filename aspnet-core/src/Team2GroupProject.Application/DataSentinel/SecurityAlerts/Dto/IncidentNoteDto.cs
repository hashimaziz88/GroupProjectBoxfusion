using System;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class IncidentNoteDto
    {
        public Guid Id { get; set; }

        public Guid AlertId { get; set; }

        public string Body { get; set; }

        public bool IsInternal { get; set; }

        public DateTime CreationTime { get; set; }

        public long? CreatorUserId { get; set; }

        public string CreatorUserDisplayName { get; set; }
    }
}
