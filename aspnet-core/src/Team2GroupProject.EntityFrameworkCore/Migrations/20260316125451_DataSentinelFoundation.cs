using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Team2GroupProject.Migrations
{
    public partial class DataSentinelFoundation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DsAlertRules",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    RuleType = table.Column<int>(type: "integer", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: true),
                    WindowMinutes = table.Column<int>(type: "integer", nullable: false),
                    ThresholdCount = table.Column<int>(type: "integer", nullable: false),
                    GroupByField = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Severity = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_DsAlertRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DsMonitoredServers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    HostName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    EnvironmentName = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Region = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_DsMonitoredServers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DsSecurityAlerts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    RuleId = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PrimaryActorUser = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PrimaryActorIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    EventTimeStart = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EventTimeEnd = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RelatedEventCount = table.Column<int>(type: "integer", nullable: false),
                    TopEvidenceJson = table.Column<string>(type: "jsonb", nullable: true),
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
                    table.PrimaryKey("PK_DsSecurityAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DsSecurityAlerts_DsAlertRules_RuleId",
                        column: x => x.RuleId,
                        principalTable: "DsAlertRules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DsMonitoredDatabases",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ServerId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Engine = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Owner = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_DsMonitoredDatabases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DsMonitoredDatabases_DsMonitoredServers_ServerId",
                        column: x => x.ServerId,
                        principalTable: "DsMonitoredServers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DsAlertStatusHistory",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    AlertId = table.Column<long>(type: "bigint", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DsAlertStatusHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DsAlertStatusHistory_DsSecurityAlerts_AlertId",
                        column: x => x.AlertId,
                        principalTable: "DsSecurityAlerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DsIncidentNotes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    AlertId = table.Column<long>(type: "bigint", nullable: false),
                    Body = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DsIncidentNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DsIncidentNotes_DsSecurityAlerts_AlertId",
                        column: x => x.AlertId,
                        principalTable: "DsSecurityAlerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DsActivityEvents",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ServerId = table.Column<long>(type: "bigint", nullable: false),
                    DatabaseId = table.Column<long>(type: "bigint", nullable: false),
                    EventTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    ActorUser = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ActorIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ObjectName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Operation = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    RowsAffected = table.Column<int>(type: "integer", nullable: true),
                    DurationMs = table.Column<int>(type: "integer", nullable: false),
                    IsOutOfHours = table.Column<bool>(type: "boolean", nullable: false),
                    IsSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    IsPrivilegedAction = table.Column<bool>(type: "boolean", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    QuerySignature = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FailureReason = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    EvidenceJson = table.Column<string>(type: "jsonb", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DsActivityEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DsActivityEvents_DsMonitoredDatabases_DatabaseId",
                        column: x => x.DatabaseId,
                        principalTable: "DsMonitoredDatabases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DsActivityEvents_DsMonitoredServers_ServerId",
                        column: x => x.ServerId,
                        principalTable: "DsMonitoredServers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_DatabaseId",
                table: "DsActivityEvents",
                column: "DatabaseId");

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_ServerId",
                table: "DsActivityEvents",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_TenantId_ActorIp_EventTime",
                table: "DsActivityEvents",
                columns: new[] { "TenantId", "ActorIp", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_TenantId_ActorUser_EventTime",
                table: "DsActivityEvents",
                columns: new[] { "TenantId", "ActorUser", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_TenantId_DatabaseId_EventTime",
                table: "DsActivityEvents",
                columns: new[] { "TenantId", "DatabaseId", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_TenantId_EventTime",
                table: "DsActivityEvents",
                columns: new[] { "TenantId", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsActivityEvents_TenantId_EventType_EventTime",
                table: "DsActivityEvents",
                columns: new[] { "TenantId", "EventType", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsAlertRules_TenantId_IsEnabled_RuleType",
                table: "DsAlertRules",
                columns: new[] { "TenantId", "IsEnabled", "RuleType" });

            migrationBuilder.CreateIndex(
                name: "IX_DsAlertRules_TenantId_Name",
                table: "DsAlertRules",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DsAlertStatusHistory_AlertId",
                table: "DsAlertStatusHistory",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_DsAlertStatusHistory_TenantId_AlertId_CreationTime",
                table: "DsAlertStatusHistory",
                columns: new[] { "TenantId", "AlertId", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsIncidentNotes_AlertId",
                table: "DsIncidentNotes",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_DsIncidentNotes_TenantId_AlertId_CreationTime",
                table: "DsIncidentNotes",
                columns: new[] { "TenantId", "AlertId", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsMonitoredDatabases_ServerId",
                table: "DsMonitoredDatabases",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_DsMonitoredDatabases_TenantId_ServerId_Name",
                table: "DsMonitoredDatabases",
                columns: new[] { "TenantId", "ServerId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DsMonitoredServers_TenantId_HostName",
                table: "DsMonitoredServers",
                columns: new[] { "TenantId", "HostName" });

            migrationBuilder.CreateIndex(
                name: "IX_DsMonitoredServers_TenantId_Name",
                table: "DsMonitoredServers",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DsSecurityAlerts_RuleId",
                table: "DsSecurityAlerts",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_DsSecurityAlerts_TenantId_PrimaryActorUser_CreationTime",
                table: "DsSecurityAlerts",
                columns: new[] { "TenantId", "PrimaryActorUser", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsSecurityAlerts_TenantId_RuleId_CreationTime",
                table: "DsSecurityAlerts",
                columns: new[] { "TenantId", "RuleId", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DsSecurityAlerts_TenantId_Status_Severity_CreationTime",
                table: "DsSecurityAlerts",
                columns: new[] { "TenantId", "Status", "Severity", "CreationTime" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DsActivityEvents");

            migrationBuilder.DropTable(
                name: "DsAlertStatusHistory");

            migrationBuilder.DropTable(
                name: "DsIncidentNotes");

            migrationBuilder.DropTable(
                name: "DsMonitoredDatabases");

            migrationBuilder.DropTable(
                name: "DsSecurityAlerts");

            migrationBuilder.DropTable(
                name: "DsMonitoredServers");

            migrationBuilder.DropTable(
                name: "DsAlertRules");
        }
    }
}
