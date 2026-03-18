using System;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class UpdateAlertStatusInput
    {
        public Guid AlertId { get; set; }

        public SecurityAlertStatus NewStatus { get; set; }

        /// <summary>Optional comment recorded in the status history.</summary>
        public string Comment { get; set; }
    }
}
