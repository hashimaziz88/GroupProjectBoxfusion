using System;
using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class GetMonitoredTablesInput
    {
        [Required]
        public Guid DatabaseId { get; set; }
    }
}
