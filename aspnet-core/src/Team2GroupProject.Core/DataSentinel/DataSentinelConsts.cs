namespace Team2GroupProject.DataSentinel
{
    public static class DataSentinelConsts
    {
        public const string DbTablePrefix = "DataSentinel";

        public const int NameMaxLength = 128;
        public const int SchemaNameMaxLength = 128;
        public const int HostNameMaxLength = 256;
        public const int EnvironmentMaxLength = 64;
        public const int EngineMaxLength = 64;
        public const int DescriptionMaxLength = 1024;
        public const int AlertTitleMaxLength = 256;
        public const int AlertSummaryMaxLength = 2048;
        public const int IncidentNoteBodyMaxLength = 4000;
        public const int StatusHistoryCommentMaxLength = 1024;
        public const int SourceSystemMaxLength = 64;
        public const int SourceEventKeyMaxLength = 128;
        public const int AlertCorrelationKeyMaxLength = 128;

        // ActivityEvent field lengths
        public const int ActorUserMaxLength = 256;
        public const int ActorIpMaxLength = 64;
        public const int ObjectNameMaxLength = 256;
        public const int OperationMaxLength = 64;
        public const int FailureReasonMaxLength = 512;
    }
}
