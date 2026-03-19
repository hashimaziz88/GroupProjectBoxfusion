using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class Add_UserRiskProfile_StatusAndEventCounters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "DataSentinelUserRiskProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalEventCount",
                table: "DataSentinelUserRiskProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActivityAt",
                table: "DataSentinelUserRiskProfiles",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_Status",
                table: "DataSentinelUserRiskProfiles",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_Status",
                table: "DataSentinelUserRiskProfiles");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "DataSentinelUserRiskProfiles");

            migrationBuilder.DropColumn(
                name: "TotalEventCount",
                table: "DataSentinelUserRiskProfiles");

            migrationBuilder.DropColumn(
                name: "LastActivityAt",
                table: "DataSentinelUserRiskProfiles");
        }
    }
}
