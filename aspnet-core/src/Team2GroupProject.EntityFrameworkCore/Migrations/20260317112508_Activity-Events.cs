using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class ActivityEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataSentinelActivityEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ServerId = table.Column<Guid>(type: "uuid", nullable: true),
                    DatabaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    EventTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    ActorUser = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ActorIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ObjectName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Operation = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    RowsAffected = table.Column<int>(type: "integer", nullable: true),
                    DurationMs = table.Column<int>(type: "integer", nullable: true),
                    IsOutOfHours = table.Column<bool>(type: "boolean", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    IsSuccess = table.Column<bool>(type: "boolean", nullable: false),
                    FailureReason = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    EvidenceJson = table.Column<string>(type: "text", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSentinelActivityEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DataSentinelActivityEvents_DataSentinelMonitoredDatabases_D~",
                        column: x => x.DatabaseId,
                        principalTable: "DataSentinelMonitoredDatabases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DataSentinelActivityEvents_DataSentinelMonitoredServers_Ser~",
                        column: x => x.ServerId,
                        principalTable: "DataSentinelMonitoredServers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_DatabaseId",
                table: "DataSentinelActivityEvents",
                column: "DatabaseId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_ServerId",
                table: "DataSentinelActivityEvents",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_ActorUser_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "ActorUser", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_DatabaseId_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "DatabaseId", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_EventType_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "EventType", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_IsSuccess_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "IsSuccess", "EventTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_Severity_EventTime",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "Severity", "EventTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataSentinelActivityEvents");
        }
    }
}
