using System;

namespace Team2GroupProject.DataSentinel.Dto
{
    public class IncidentNoteDto
    {
        public long Id { get; set; }

        public DateTime CreatedAt { get; set; }

        public long? CreatedByUserId { get; set; }

        public string CreatedByName { get; set; }

        public string Body { get; set; }

        public bool IsInternal { get; set; }
    }
}
