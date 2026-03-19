using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using Team2GroupProject.Authorization;
using Team2GroupProject.DataSentinel.ActivityEvents;
using Team2GroupProject.DataSentinel.Monitoring;
using Team2GroupProject.DataSentinel.SecurityAlerts.Dto;

namespace Team2GroupProject.DataSentinel.SecurityAlerts
{
    [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_View)]
    public class SecurityAlertAppService : Team2GroupProjectAppServiceBase, ISecurityAlertAppService
    {
        private static readonly List<string> DefaultRecommendedActions = new()
        {
            "Review user activity history for patterns",
            "Verify if activity was authorized",
            "Contact user or their manager",
            "Update alert status and add notes"
        };

        private readonly ISecurityAlertRepository _securityAlertRepository;
        private readonly IAlertStatusHistoryRepository _alertStatusHistoryRepository;
        private readonly IMonitoredServerRepository _monitoredServerRepository;
        private readonly IMonitoredDatabaseRepository _monitoredDatabaseRepository;
        private readonly IMonitoredTableRepository _monitoredTableRepository;

        public SecurityAlertAppService(
            ISecurityAlertRepository securityAlertRepository,
            IAlertStatusHistoryRepository alertStatusHistoryRepository,
            IMonitoredServerRepository monitoredServerRepository,
            IMonitoredDatabaseRepository monitoredDatabaseRepository,
            IMonitoredTableRepository monitoredTableRepository)
        {
            _securityAlertRepository = securityAlertRepository;
            _alertStatusHistoryRepository = alertStatusHistoryRepository;
            _monitoredServerRepository = monitoredServerRepository;
            _monitoredDatabaseRepository = monitoredDatabaseRepository;
            _monitoredTableRepository = monitoredTableRepository;
        }

        public async Task<PagedResultDto<SecurityAlertDto>> GetPagedAsync(GetSecurityAlertsInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var query = BuildFilteredQuery(tenantId, input);

            var totalCount = await query.CountAsync();

            var rows = await (
                from a in query.OrderByDescending(x => x.TriggeredAt).Skip(input.SkipCount).Take(input.MaxResultCount)
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
            ).ToListAsync();

            var items = rows.Select(x => MapToDto(x.Alert, x.ServerName, x.DatabaseName, x.TableName)).ToList();

            return new PagedResultDto<SecurityAlertDto>(totalCount, items);
        }

        public async Task<SecurityAlertDetailDto> GetByIdAsync(Guid id)
        {
            var tenantId = AbpSession.GetTenantId();

            var row = await (
                from a in _securityAlertRepository.GetAll().Where(x => x.TenantId == tenantId && x.Id == id)
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

            var dto = MapToDto(row.Alert, row.ServerName, row.DatabaseName, row.TableName);

            return new SecurityAlertDetailDto
            {
                Id = dto.Id,
                AlertId = dto.AlertId,
                Title = dto.Title,
                Summary = dto.Summary,
                Severity = dto.Severity,
                RiskScore = dto.RiskScore,
                Status = dto.Status,
                TriggeredAt = dto.TriggeredAt,
                ServerId = dto.ServerId,
                ServerName = dto.ServerName,
                DatabaseId = dto.DatabaseId,
                DatabaseName = dto.DatabaseName,
                TableId = dto.TableId,
                TableName = dto.TableName,
                PrimaryActorUser = dto.PrimaryActorUser,
                PrimaryActorIp = dto.PrimaryActorIp,
                EventTimeStart = dto.EventTimeStart,
                EventTimeEnd = dto.EventTimeEnd,
                RelatedEventCount = dto.RelatedEventCount,
                RecommendedActions = DefaultRecommendedActions
            };
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_Review)]
        public async Task UpdateStatusAsync(UpdateAlertStatusInput input)
        {
            var tenantId = AbpSession.GetTenantId();
            var alert = await _securityAlertRepository.GetAll()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == input.AlertId);

            if (alert == null)
            {
                throw new UserFriendlyException("Security alert not found.");
            }

            var now = DateTime.UtcNow;
            var userId = AbpSession.UserId;
            var fromStatus = alert.Status;

            switch (input.NewStatus)
            {
                case SecurityAlertStatus.Acknowledged:
                    alert.Acknowledge(now, userId);
                    break;
                case SecurityAlertStatus.Investigating:
                    alert.StartInvestigation(now, userId);
                    break;
                case SecurityAlertStatus.Resolved:
                    alert.Resolve(now, userId);
                    break;
                case SecurityAlertStatus.Dismissed:
                    alert.Dismiss(now, userId);
                    break;
                default:
                    throw new UserFriendlyException($"Cannot manually set status to {input.NewStatus}.");
            }

            await _securityAlertRepository.UpdateAsync(alert);

            var historyEntry = new AlertStatusHistory(tenantId, alert.Id, fromStatus, alert.Status, input.Comment);
            await _alertStatusHistoryRepository.InsertAsync(historyEntry);
        }

        [AbpAuthorize(PermissionNames.Pages_DataSentinel_Alerts_Review)]
        public async Task BulkUpdateStatusAsync(BulkUpdateAlertStatusInput input)
        {
            var alertIds = input.AlertIds?
                .Where(x => x != Guid.Empty)
                .Distinct()
                .ToList() ?? new List<Guid>();

            if (alertIds.Count == 0)
            {
                throw new UserFriendlyException("Select at least one alert to update.");
            }

            if (input.NewStatus != SecurityAlertStatus.Resolved &&
                input.NewStatus != SecurityAlertStatus.Dismissed)
            {
                throw new UserFriendlyException(
                    "Bulk review only supports resolving or dismissing alerts.");
            }

            var tenantId = AbpSession.GetTenantId();
            var alerts = await _securityAlertRepository.GetAll()
                .Where(x => x.TenantId == tenantId && alertIds.Contains(x.Id))
                .ToListAsync();

            if (alerts.Count != alertIds.Count)
            {
                throw new UserFriendlyException(
                    "One or more selected alerts were not found for this tenant.");
            }

            if (alerts.Any(x => x.Status != SecurityAlertStatus.New))
            {
                throw new UserFriendlyException(
                    "Bulk review is only available for new alerts.");
            }

            var now = DateTime.UtcNow;
            var userId = AbpSession.UserId;

            foreach (var alert in alerts)
            {
                if (input.NewStatus == SecurityAlertStatus.Resolved)
                {
                    alert.Resolve(now, userId);
                }
                else
                {
                    alert.Dismiss(now, userId);
                }

                await _securityAlertRepository.UpdateAsync(alert);

                var historyEntry = new AlertStatusHistory(
                    tenantId,
                    alert.Id,
                    SecurityAlertStatus.New,
                    alert.Status,
                    input.Comment);

                await _alertStatusHistoryRepository.InsertAsync(historyEntry);
            }
        }

        public async Task<SecurityAlertFilterOptionsDto> GetFilterOptionsAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            var alerts = _securityAlertRepository.GetAll().Where(x => x.TenantId == tenantId);

            var databaseIds = await alerts
                .Where(x => x.DatabaseId.HasValue)
                .Select(x => x.DatabaseId.Value)
                .Distinct()
                .ToListAsync();

            var databases = await _monitoredDatabaseRepository.GetAll()
                .Where(x => x.TenantId == tenantId && databaseIds.Contains(x.Id))
                .OrderBy(x => x.Name)
                .Select(x => new AlertDatabaseOptionDto { Id = x.Id, Name = x.Name })
                .ToListAsync();

            return new SecurityAlertFilterOptionsDto
            {
                Databases = databases
            };
        }

        private IQueryable<SecurityAlert> BuildFilteredQuery(int tenantId, GetSecurityAlertsInput input)
        {
            var query = _securityAlertRepository.GetAll().Where(x => x.TenantId == tenantId);

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                var keyword = input.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    (x.Title != null && x.Title.ToLower().Contains(keyword)) ||
                    (x.Summary != null && x.Summary.ToLower().Contains(keyword)) ||
                    (x.PrimaryActorUser != null && x.PrimaryActorUser.ToLower().Contains(keyword)));
            }

            if (input.Severity.HasValue)
            {
                query = query.Where(x => x.Severity == input.Severity.Value);
            }

            if (input.Status.HasValue)
            {
                query = query.Where(x => x.Status == input.Status.Value);
            }

            if (input.DatabaseId.HasValue)
            {
                query = query.Where(x => x.DatabaseId == input.DatabaseId.Value);
            }

            if (input.StartDate.HasValue)
            {
                query = query.Where(x => x.TriggeredAt >= input.StartDate.Value);
            }

            if (input.EndDate.HasValue)
            {
                query = query.Where(x => x.TriggeredAt <= input.EndDate.Value);
            }

            return query;
        }

        private static SecurityAlertDto MapToDto(
            SecurityAlert alert,
            string serverName,
            string databaseName,
            string tableName)
        {
            return new SecurityAlertDto
            {
                Id = alert.Id,
                AlertId = $"ALT-{alert.TriggeredAt:yyyy}-{alert.TriggeredAt:MMdd}-{alert.Id.ToString("N")[..3].ToUpper()}",
                Title = alert.Title,
                Summary = alert.Summary,
                Severity = alert.Severity,
                RiskScore = ComputeRiskScore(alert.Severity, alert.RelatedEventCount),
                Status = alert.Status,
                TriggeredAt = alert.TriggeredAt,
                ServerId = alert.ServerId,
                ServerName = serverName,
                DatabaseId = alert.DatabaseId,
                DatabaseName = databaseName,
                TableId = alert.TableId,
                TableName = tableName,
                PrimaryActorUser = alert.PrimaryActorUser,
                PrimaryActorIp = alert.PrimaryActorIp,
                EventTimeStart = alert.EventTimeStart,
                EventTimeEnd = alert.EventTimeEnd,
                RelatedEventCount = alert.RelatedEventCount
            };
        }

        private static int ComputeRiskScore(ActivitySeverity severity, int relatedEventCount)
        {
            var baseScore = severity switch
            {
                ActivitySeverity.Info => 15,
                ActivitySeverity.Low => 30,
                ActivitySeverity.Medium => 50,
                ActivitySeverity.High => 75,
                ActivitySeverity.Critical => 90,
                _ => 15
            };

            return Math.Min(100, baseScore + relatedEventCount / 10);
        }
    }
}
