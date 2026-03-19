using System;
using System.Collections.Generic;
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
using Team2GroupProject.Authorization.Users;
using Team2GroupProject.DataSentinel.Monitoring;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Reports_Export)]
    public class IncidentReportAppService : IIncidentReportAppService
    {
        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IAlertStatusHistoryRepository _alertStatusHistoryRepository;
        private readonly IIncidentNoteRepository _incidentNoteRepository;
        private readonly IMonitoredServerRepository _monitoredServerRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;
        private readonly IAbpSession _abpSession;
        private readonly UserManager _userManager;

        public IncidentReportAppService(
            ISecurityAlertRepository securityAlertRepository,
            IAlertStatusHistoryRepository alertStatusHistoryRepository,
            IIncidentNoteRepository incidentNoteRepository,
            IMonitoredServerRepository monitoredServerRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IMonitoredTableRepository monitoredTableRepository,
            IAbpSession abpSession,
            UserManager userManager)
        {
            _securityAlertRepository = securityAlertRepository;
            _alertStatusHistoryRepository = alertStatusHistoryRepository;
            _incidentNoteRepository = incidentNoteRepository;
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _monitoredTableRepository = monitoredTableRepository;
            _abpSession = abpSession;
            _userManager = userManager;
        }

        public async Task<byte[]> GenerateReportAsync(Guid alertId)
        {
            var tenantId = _abpSession.GetTenantId();

            var row = await (
                from a in _securityAlertRepository.GetAll().Where(x => x.TenantId == tenantId && x.Id == alertId)
                join s in _monitoredServerRepository.GetAll() on a.ServerId equals s.Id into serverJoin
                from srv in serverJoin.DefaultIfEmpty()
                join d in _monitoredDatabaseRepository.GetAll() on a.DatabaseId equals d.Id into dbJoin
                from db in dbJoin.DefaultIfEmpty()
                join t in _monitoredTableRepository.GetAll() on a.TableId equals t.Id into tableJoin
                from tbl in tableJoin.DefaultIfEmpty()
                select new
                {
                    Alert = a,
                    ServerName = (string)srv.Name,
                    DatabaseName = (string)db.Name,
                    TableName = (string)tbl.Name
                }
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

            var userDisplayNames = await ResolveUserDisplayNamesAsync(
                statusHistory.Select(x => x.CreatorUserId)
                    .Concat(notes.Select(x => x.CreatorUserId))
                    .Where(x => x.HasValue)
                    .Select(x => x.Value));

            QuestPDF.Settings.License = LicenseType.Community;

            var alert = row.Alert;
            var displayAlertId =
                $"ALT-{alert.TriggeredAt:yyyy}-{alert.TriggeredAt:MMdd}-{alert.Id.ToString("N")[..3].ToUpper()}";
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
                        col.Item().Text("DataSentinel Incident Report")
                            .FontSize(18).Bold().FontColor(Colors.Grey.Darken3);
                        col.Item().Text($"Generated: {generatedAt:yyyy-MM-dd HH:mm} UTC")
                            .FontSize(9).FontColor(Colors.Grey.Medium);
                        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    page.Content().PaddingTop(16).Column(col =>
                    {
                        col.Item().Text("Alert Details").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                            });

                            AddRow(table, "Alert ID", displayAlertId);
                            AddRow(table, "Title", alert.Title);
                            AddRow(table, "Severity", alert.Severity.ToString());
                            AddRow(table, "Status", alert.Status.ToString());
                            AddRow(table, "Triggered At", $"{alert.TriggeredAt:yyyy-MM-dd HH:mm:ss} UTC");
                            AddRow(table, "Actor User", alert.PrimaryActorUser ?? "-");
                            AddRow(table, "Actor IP", alert.PrimaryActorIp ?? "-");
                        });

                        col.Item().PaddingTop(14).Text("Summary").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Background(Colors.Grey.Lighten4)
                            .Padding(8).Text(alert.Summary ?? "No summary provided.")
                            .FontColor(Colors.Grey.Darken2);

                        col.Item().PaddingTop(14).Text("Affected Resources").FontSize(13).Bold();
                        col.Item().PaddingTop(6).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(2);
                                c.RelativeColumn(3);
                            });

                            AddRow(table, "Server", row.ServerName ?? "-");
                            AddRow(table, "Database", row.DatabaseName ?? "-");
                            AddRow(table, "Table", row.TableName ?? "-");
                            AddRow(table, "Related Events", alert.RelatedEventCount.ToString());
                            AddRow(table, "Event Time Start", $"{alert.EventTimeStart:yyyy-MM-dd HH:mm:ss} UTC");
                            AddRow(table, "Event Time End", $"{alert.EventTimeEnd:yyyy-MM-dd HH:mm:ss} UTC");
                        });

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
                                    c.RelativeColumn(2);
                                    c.RelativeColumn(3);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("From").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("To").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Changed By").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("When (UTC)").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten3).Padding(4).Text("Comment").Bold();
                                });

                                foreach (var entry in statusHistory)
                                {
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.FromStatus.ToString());
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.ToStatus.ToString());
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(ResolveUserDisplayName(userDisplayNames, entry.CreatorUserId));
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text($"{entry.CreationTime:yyyy-MM-dd HH:mm}");
                                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4)
                                        .Text(entry.Comment ?? "-");
                                }
                            });
                        }

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
                                    noteCol.Item().Text(
                                            $"{note.CreationTime:yyyy-MM-dd HH:mm} UTC | {ResolveUserDisplayName(userDisplayNames, note.CreatorUserId)}")
                                        .FontSize(9).FontColor(Colors.Grey.Medium);
                                    noteCol.Item().Background(Colors.Grey.Lighten4)
                                        .Padding(8).Text(note.Body);
                                });
                            }
                        }
                    });

                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("DataSentinel Incident Report | Confidential | Page ");
                        text.CurrentPageNumber();
                        text.Span(" of ");
                        text.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }

        private async Task<Dictionary<long, string>> ResolveUserDisplayNamesAsync(IEnumerable<long> userIds)
        {
            var resolvedIds = userIds.Distinct().ToList();

            if (resolvedIds.Count == 0)
            {
                return new Dictionary<long, string>();
            }

            var users = await _userManager.Users
                .Where(x => resolvedIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.UserName,
                    x.Name,
                    x.Surname
                })
                .ToListAsync();

            return users.ToDictionary(
                x => x.Id,
                x =>
                {
                    var fullName = $"{x.Name} {x.Surname}".Trim();
                    return string.IsNullOrWhiteSpace(fullName) ? x.UserName : fullName;
                });
        }

        private static string ResolveUserDisplayName(
            IReadOnlyDictionary<long, string> userDisplayNames,
            long? userId)
        {
            return userId.HasValue && userDisplayNames.TryGetValue(userId.Value, out var name)
                ? name
                : "System";
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
