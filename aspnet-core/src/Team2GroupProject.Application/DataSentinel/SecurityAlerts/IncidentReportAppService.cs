using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Reports_Export)]
    public class IncidentReportAppService : Team2GroupProjectAppServiceBase, IIncidentReportAppService
    {
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IAlertStatusHistoryRepository _alertStatusHistoryRepository;
        private readonly IIncidentNoteRepository _incidentNoteRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;

        public IncidentReportAppService(
            ISecurityAlertRepository securityAlertRepository,
            IAlertStatusHistoryRepository alertStatusHistoryRepository,
            IIncidentNoteRepository incidentNoteRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IMonitoredTableRepository monitoredTableRepository)
        {
            _securityAlertRepository = securityAlertRepository;
            _alertStatusHistoryRepository = alertStatusHistoryRepository;
            _incidentNoteRepository = incidentNoteRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _monitoredTableRepository = monitoredTableRepository;
        }

        public async Task<byte[]> GenerateReportAsync(Guid alertId)
        {
            var tenantId = AbpSession.GetTenantId();

            var row = await (
                from a in _securityAlertRepository.GetAll().Where(x => x.TenantId == tenantId && x.Id == alertId)
                join d in _monitoredDatabaseRepository.GetAll() on a.DatabaseId equals d.Id into dbJoin
                from db in dbJoin.DefaultIfEmpty()
                join t in _monitoredTableRepository.GetAll() on a.TableId equals t.Id into tableJoin
                from tbl in tableJoin.DefaultIfEmpty()
                select new { Alert = a, DatabaseName = (string)db.Name, TableName = (string)tbl.Name }
            ).FirstOrDefaultAsync();

            if (row == null)
            {
                throw new UserFriendlyException("Security alert not found.");
            }

            var statusHistory = await _alertStatusHistoryRepository.GetAll()
                .Where(x => x.AlertId == alertId)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();

            var notes = await _incidentNoteRepository.GetAll()
                .Where(x => x.AlertId == alertId && !x.IsInternal)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();

            QuestPDF.Settings.License = LicenseType.Community;

            var alert = row.Alert;
            var alertId_display = $"ALT-{alert.TriggeredAt:yyyy}-{alert.TriggeredAt:MMdd}-{alert.Id.ToString("N")[..3].ToUpper()}";
            var generatedAt = DateTime.UtcNow;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Column(col =>
                    {
                        col.Item().Text("DataSentinel — Incident Report")
                            .FontSize(18).Bold().FontColor(Colors.Grey.Darken3);
                        col.Item().Text($"Generated: {generatedAt:yyyy-MM-dd HH:mm} UTC")
                            .FontSize(9).FontColor(Colors.Grey.Medium);
                        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    page.Content().PaddingTop(16).Column(col =>
                    {
                        // ── Alert Details ────────────────────────────────────
                        col.Item().Text("Alert Details").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                            });

                            AddRow(table, "Alert ID", alertId_display);
                            AddRow(table, "Title", alert.Title);
                            AddRow(table, "Severity", alert.Severity.ToString());
                            AddRow(table, "Status", alert.Status.ToString());
                            AddRow(table, "Triggered At", $"{alert.TriggeredAt:yyyy-MM-dd HH:mm:ss} UTC");
                            AddRow(table, "Actor User", alert.PrimaryActorUser ?? "—");
                            AddRow(table, "Actor IP", alert.PrimaryActorIp ?? "—");
                        });

                        // ── Summary ──────────────────────────────────────────
                        col.Item().PaddingTop(14).Text("Summary").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Background(Colors.Grey.Lighten4)
                            .Padding(8).Text(alert.Summary ?? "No summary provided.")
                            .FontColor(Colors.Grey.Darken2);

                        // ── Affected Resources ───────────────────────────────
                        col.Item().PaddingTop(14).Text("Affected Resources").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                            });

                            AddRow(table, "Database", row.DatabaseName ?? "—");
                            AddRow(table, "Table", row.TableName ?? "—");
                            AddRow(table, "Related Events", alert.RelatedEventCount.ToString());
                            AddRow(table, "Event Time Start", $"{alert.EventTimeStart:yyyy-MM-dd HH:mm:ss} UTC");
                            AddRow(table, "Event Time End", $"{alert.EventTimeEnd:yyyy-MM-dd HH:mm:ss} UTC");
                        });

                        // ── Status History ───────────────────────────────────
                        col.Item().PaddingTop(14).Text("Status History").FontSize(13).Bold();

                        if (statusHistory.Count == 0)
                        {
                            col.Item().PaddingTop(6).Text("No status changes recorded.")
                                .FontColor(Colors.Grey.Medium).Italic();
                        }
                        else
                        {
                            col.Item().PaddingTop(6).Table(table =>
                            {
                                table.ColumnsDefinition(c =>
                                {
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(3);
                                });

                                table.Header(h =>
                                {
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("From").Bold();
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("To").Bold();
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("When (UTC)").Bold();
                                    h.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Comment").Bold();
                                });

                                foreach (var entry in statusHistory)
                                {
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.FromStatus.ToString());
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.ToStatus.ToString());
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text($"{entry.CreationTime:yyyy-MM-dd HH:mm}");
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.Comment ?? "—");
                                }
                            });
                        }

                        // ── Incident Notes ───────────────────────────────────
                        col.Item().PaddingTop(14).Text("Incident Notes").FontSize(13).Bold();

                        if (notes.Count == 0)
                        {
                            col.Item().PaddingTop(6).Text("No public notes recorded.")
                                .FontColor(Colors.Grey.Medium).Italic();
                        }
                        else
                        {
                            foreach (var note in notes)
                            {
                                col.Item().PaddingTop(6).Column(noteCol =>
                                {
                                    noteCol.Item().Text($"{note.CreationTime:yyyy-MM-dd HH:mm} UTC")
                                        .FontSize(9).FontColor(Colors.Grey.Medium);
                                    noteCol.Item().Background(Colors.Grey.Lighten4)
                                        .Padding(8).Text(note.Body);
                                });
                            }
                        }
                    });

                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("DataSentinel Incident Report — Confidential  |  Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }

        private static void AddRow(TableDescriptor table, string label, string value)
        {
            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                .Text(label).Bold().FontColor(Colors.Grey.Darken2);
            table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                .Text(value);
        }
    }
}
