namespace Team2GroupProject.DataSentinel.Dto
{
    public class MonitoredDatabaseLookupDto
    {
        public long Id { get; set; }

        public long ServerId { get; set; }

        public string ServerName { get; set; }

        public string Name { get; set; }

        public string Engine { get; set; }

        public string Owner { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }
    }
}
