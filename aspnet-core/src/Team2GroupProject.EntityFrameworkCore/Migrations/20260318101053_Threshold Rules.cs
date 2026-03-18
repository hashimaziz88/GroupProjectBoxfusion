using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class ThresholdRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CorrelationKey",
                table: "DataSentinelSecurityAlerts",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceEventKey",
                table: "DataSentinelActivityEvents",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceSystem",
                table: "DataSentinelActivityEvents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_CorrelationKey",
                table: "DataSentinelSecurityAlerts",
                columns: new[] { "TenantId", "CorrelationKey" },
                unique: true,
                filter: "\"CorrelationKey\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_SourceSystem_SourceEven~",
                table: "DataSentinelActivityEvents",
                columns: new[] { "TenantId", "SourceSystem", "SourceEventKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DataSentinelSecurityAlerts_TenantId_CorrelationKey",
                table: "DataSentinelSecurityAlerts");

            migrationBuilder.DropIndex(
                name: "IX_DataSentinelActivityEvents_TenantId_SourceSystem_SourceEven~",
                table: "DataSentinelActivityEvents");

            migrationBuilder.DropColumn(
                name: "CorrelationKey",
                table: "DataSentinelSecurityAlerts");

            migrationBuilder.DropColumn(
                name: "SourceEventKey",
                table: "DataSentinelActivityEvents");

            migrationBuilder.DropColumn(
                name: "SourceSystem",
                table: "DataSentinelActivityEvents");
        }
    }
}
