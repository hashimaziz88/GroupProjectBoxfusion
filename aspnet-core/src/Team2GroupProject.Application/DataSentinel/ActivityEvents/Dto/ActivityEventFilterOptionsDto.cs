using System;
using System.Collections.Generic;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class ActivityEventFilterOptionsDto
    {
        /// <summary>Distinct monitored databases that have at least one event — for the "All Databases" dropdown.</summary>
        public List<DatabaseOptionDto> Databases { get; set; } = new();

        /// <summary>Distinct actor users observed in events — for the "All Users" dropdown.</summary>
        public List<string> Users { get; set; } = new();
    }

    public class DatabaseOptionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }
}
