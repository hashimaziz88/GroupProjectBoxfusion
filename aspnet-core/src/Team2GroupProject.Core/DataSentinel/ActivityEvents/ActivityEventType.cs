namespace Team2GroupProject.DataSentinel.ActivityEvents
{
    public enum ActivityEventType
    {
        Login = 0,
        Logout = 1,
        Read = 2,
        Write = 3,
        Delete = 4,
        SchemaChange = 5,
        PrivilegedAction = 6,
        PermissionChange = 7,
        BulkOperation = 8,
        Other = 99
    }
}
