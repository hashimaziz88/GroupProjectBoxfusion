using System;
using Abp.Extensions;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class CreateIncidentNoteInput
    {
        public Guid AlertId { get; set; }

        public string Body { get; set; }

        public bool IsInternal { get; set; }
    }
}
