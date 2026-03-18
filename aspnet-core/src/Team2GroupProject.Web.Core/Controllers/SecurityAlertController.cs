using System;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.SecurityAlerts;

namespace Team2GroupProject.Controllers
{
    [AbpMvcAuthorize(PermissionNames.Pages_DataSentinel_Reports_Export)]
    [Route("api/SecurityAlert")]
    public class SecurityAlertController : Team2GroupProjectControllerBase
    {
        private readonly IIncidentReportAppService _incidentReportAppService;

        public SecurityAlertController(IIncidentReportAppService incidentReportAppService)
        {
            _incidentReportAppService = incidentReportAppService;
        }

        [HttpGet("ExportReport")]
        public async Task<IActionResult> ExportReport([FromQuery] Guid alertId)
        {
            var pdfBytes = await _incidentReportAppService.GenerateReportAsync(alertId);
            var fileName = $"incident-report-{alertId:N}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }
    }
}
