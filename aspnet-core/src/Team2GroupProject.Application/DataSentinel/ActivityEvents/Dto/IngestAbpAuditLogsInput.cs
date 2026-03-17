using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class IngestAbpAuditLogsInput
    {
        public Guid? ServerId { get; set; }

        public Guid? DatabaseId { get; set; }

        [Required]
        [MinLength(1)]
        public List<AbpAuditLogIngestionItemDto> AbpAuditLogs { get; set; } = new List<AbpAuditLogIngestionItemDto>();
    }
}
