using System;
using System.ComponentModel.DataAnnotations;
using Team2GroupProject.DataSentinel;

namespace Team2GroupProject.DataSentinel.Monitoring.Dto
{
    public class CreateMonitoredTableInput
    {
        [Required]
        public Guid DatabaseId { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.SchemaNameMaxLength)]
        public string SchemaName { get; set; }

        [Required]
        [StringLength(DataSentinelConsts.NameMaxLength)]
        public string Name { get; set; }

        [StringLength(DataSentinelConsts.DescriptionMaxLength)]
        public string Description { get; set; }

        public bool IsEnabled { get; set; } = true;
    }
}
