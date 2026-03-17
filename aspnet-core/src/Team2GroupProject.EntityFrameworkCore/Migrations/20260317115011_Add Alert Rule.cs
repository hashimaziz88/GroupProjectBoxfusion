using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataSentinelAlertRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    RuleType = table.Column<int>(type: "integer", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: true),
                    WindowMinutes = table.Column<int>(type: "integer", nullable: false),
                    ThresholdCount = table.Column<int>(type: "integer", nullable: false),
                    GroupByField = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("PK_DataSentinelAlertRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelAlertRules_TenantId_IsEnabled",
                table: "DataSentinelAlertRules",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelAlertRules_TenantId_RuleType_IsEnabled",
                table: "DataSentinelAlertRules",
                columns: new[] { "TenantId", "RuleType", "IsEnabled" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataSentinelAlertRules");
        }
    }
}
