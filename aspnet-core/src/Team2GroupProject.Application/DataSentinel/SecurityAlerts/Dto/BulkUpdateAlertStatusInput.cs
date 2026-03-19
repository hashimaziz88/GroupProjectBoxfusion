using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class BulkUpdateAlertStatusInput
    {
        public List<Guid> AlertIds { get; set; } = new();

        public SecurityAlertStatus NewStatus { get; set; }

        public string Comment { get; set; }
    }
}
