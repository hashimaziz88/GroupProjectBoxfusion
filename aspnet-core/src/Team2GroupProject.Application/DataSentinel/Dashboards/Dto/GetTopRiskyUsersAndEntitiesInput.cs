namespace Team2GroupProject.DataSentinel.Dashboards.Dto
{
    public class GetTopRiskyUsersAndEntitiesInput : DashboardWindowInput
    {
        public int MaxUsers { get; set; } = 5;

        public int MaxEntities { get; set; } = 5;
    }
}
