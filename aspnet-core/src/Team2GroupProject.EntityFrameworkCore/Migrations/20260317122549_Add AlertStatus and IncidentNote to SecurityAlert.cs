using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertStatusandIncidentNotetoSecurityAlert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataSentinelAlertStatusHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    AlertId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSentinelAlertStatusHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DataSentinelAlertStatusHistory_DataSentinelSecurityAlerts_A~",
                        column: x => x.AlertId,
                        principalTable: "DataSentinelSecurityAlerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DataSentinelIncidentNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    AlertId = table.Column<Guid>(type: "uuid", nullable: false),
                    Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSentinelIncidentNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DataSentinelIncidentNotes_DataSentinelSecurityAlerts_AlertId",
                        column: x => x.AlertId,
                        principalTable: "DataSentinelSecurityAlerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelAlertStatusHistory_AlertId",
                table: "DataSentinelAlertStatusHistory",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelAlertStatusHistory_TenantId_AlertId_CreationTime",
                table: "DataSentinelAlertStatusHistory",
                columns: new[] { "TenantId", "AlertId", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelAlertStatusHistory_TenantId_AlertId_ToStatus_Cr~",
                table: "DataSentinelAlertStatusHistory",
                columns: new[] { "TenantId", "AlertId", "ToStatus", "CreationTime" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelIncidentNotes_AlertId",
                table: "DataSentinelIncidentNotes",
                column: "AlertId");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelIncidentNotes_TenantId_AlertId_CreationTime",
                table: "DataSentinelIncidentNotes",
                columns: new[] { "TenantId", "AlertId", "CreationTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataSentinelAlertStatusHistory");

            migrationBuilder.DropTable(
                name: "DataSentinelIncidentNotes");
        }
    }
}
