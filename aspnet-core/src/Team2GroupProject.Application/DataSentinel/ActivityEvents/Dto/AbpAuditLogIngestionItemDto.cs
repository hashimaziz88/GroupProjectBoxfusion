using System;

namespace Team2GroupProject.DataSentinel.ActivityEvents.Dto
{
    public class AbpAuditLogIngestionItemDto
    {
        public long? Id { get; set; }

        public int? TenantId { get; set; }

        public long? UserId { get; set; }

        public string ServiceName { get; set; }

        public string MethodName { get; set; }

        public string Parameters { get; set; }

        public string ReturnValue { get; set; }

        public DateTime? ExecutionTime { get; set; }

        public int? ExecutionDuration { get; set; }

        public string ClientIpAddress { get; set; }

        public string ClientName { get; set; }

        public string BrowserInfo { get; set; }

        public string ExceptionMessage { get; set; }

        public string Exception { get; set; }

        public long? ImpersonatorUserId { get; set; }

        public int? ImpersonatorTenantId { get; set; }

        public string CustomData { get; set; }
    }
}
