using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.SecurityAlerts.Dto
{
    public class SecurityAlertFilterOptionsDto
    {
        /// <summary>Distinct monitored databases that have at least one alert — for the "All Databases" dropdown.</summary>
        public List<AlertDatabaseOptionDto> Databases { get; set; } = new();
    }

    public class AlertDatabaseOptionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}
