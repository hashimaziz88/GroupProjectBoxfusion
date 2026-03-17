using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityALert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataSentinelSecurityAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    RuleId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggeringActivityEventId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DatabaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    TableId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TriggeredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EventTimeStart = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EventTimeEnd = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RelatedEventCount = table.Column<int>(type: "integer", nullable: false),
                    PrimaryActorUser = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PrimaryActorIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    EvidenceSummaryJson = table.Column<string>(type: "text", nullable: true),
                    LastStatusChangedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastStatusChangedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DismissedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSentinelSecurityAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DataSentinelSecurityAlerts_DataSentinelActivityEvents_Trigg~",
                        column: x => x.TriggeringActivityEventId,
                        principalTable: "DataSentinelActivityEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DataSentinelSecurityAlerts_DataSentinelAlertRules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "DataSentinelAlertRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DataSentinelSecurityAlerts_DataSentinelMonitoredDatabases_D~",
                        column: x => x.DatabaseId,
                        principalTable: "DataSentinelMonitoredDatabases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DataSentinelSecurityAlerts_DataSentinelMonitoredServers_Ser~",
                        column: x => x.ServerId,
                        principalTable: "DataSentinelMonitoredServers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DataSentinelSecurityAlerts_DataSentinelMonitoredTables_Tabl~",
                        column: x => x.TableId,
                        principalTable: "DataSentinelMonitoredTables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_DatabaseId",
                table: "DataSentinelSecurityAlerts",
                column: "DatabaseId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_RuleId",
                table: "DataSentinelSecurityAlerts",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_ServerId",
                table: "DataSentinelSecurityAlerts",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TableId",
                table: "DataSentinelSecurityAlerts",
                column: "TableId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_DatabaseId_TriggeredAt",
                table: "DataSentinelSecurityAlerts",
                columns: new[] { "TenantId", "DatabaseId", "TriggeredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_PrimaryActorUser_Trigge~",
                table: "DataSentinelSecurityAlerts",
                columns: new[] { "TenantId", "PrimaryActorUser", "TriggeredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_RuleId_TriggeredAt",
                table: "DataSentinelSecurityAlerts",
                columns: new[] { "TenantId", "RuleId", "TriggeredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_Status_Severity_Trigger~",
                table: "DataSentinelSecurityAlerts",
                columns: new[] { "TenantId", "Status", "Severity", "TriggeredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TriggeringActivityEventId",
                table: "DataSentinelSecurityAlerts",
                column: "TriggeringActivityEventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataSentinelSecurityAlerts");
        }
    }
}
