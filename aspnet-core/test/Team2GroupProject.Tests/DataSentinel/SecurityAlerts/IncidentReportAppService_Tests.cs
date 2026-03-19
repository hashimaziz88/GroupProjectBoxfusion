using System;
using System.Threading.Tasks;
using Abp.Authorization;
using Shouldly;
using Team2GroupProject.DataSentinel.SecurityAlerts;
using Xunit;

namespace Team2GroupProject.Tests.DataSentinel.SecurityAlerts
{
    public class IncidentReportAppService_Tests : Team2GroupProjectTestBase
    {
        private readonly IIncidentReportAppService _incidentReportAppService;

        public IncidentReportAppService_Tests()
        {
            _incidentReportAppService = Resolve<IIncidentReportAppService>();
        }

        [Fact]
        public async Task GenerateReportAsync_should_require_authenticated_user()
        {
            var previousTenantId = AbpSession.TenantId;
            var previousUserId = AbpSession.UserId;

            try
            {
                AbpSession.TenantId = 1;
                AbpSession.UserId = null;

                await Should.ThrowAsync<AbpAuthorizationException>(() =>
                    _incidentReportAppService.GenerateReportAsync(Guid.NewGuid()));
            }
            finally
            {
                AbpSession.TenantId = previousTenantId;
                AbpSession.UserId = previousUserId;
            }
        }
    }
}
