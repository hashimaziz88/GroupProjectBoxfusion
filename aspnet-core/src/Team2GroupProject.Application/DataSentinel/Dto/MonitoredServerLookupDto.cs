namespace Team2GroupProject.DataSentinel.Dto
{
    public class MonitoredServerLookupDto
    {
        public long Id { get; set; }

        public string Name { get; set; }

        public string HostName { get; set; }

        public string EnvironmentName { get; set; }

        public string Region { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }
    }
}
