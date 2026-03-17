using System;
using System.ComponentModel.DataAnnotations;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class SeedSimulatedAbpAuditLogsInput
    {
        public Guid? ServerId { get; set; }

        public Guid? DatabaseId { get; set; }

        [Range(1, 500)]
        public int Count { get; set; } = 50;

        public int? Seed { get; set; }

        public bool IncludeFailures { get; set; } = true;
    }
}
