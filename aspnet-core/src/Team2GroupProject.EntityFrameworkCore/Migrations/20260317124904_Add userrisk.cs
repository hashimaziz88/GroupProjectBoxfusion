using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Team2GroupProject.Migrations
{
    /// <inheritdoc />
    public partial class Adduserrisk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DataSentinelUserRiskProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    ActorUser = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ActorIp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    RiskScore = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<int>(type: "integer", nullable: false),
                    LastEvaluatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    AlertCount = table.Column<int>(type: "integer", nullable: false),
                    FailedLoginCount = table.Column<int>(type: "integer", nullable: false),
                    PrivilegedActionCount = table.Column<int>(type: "integer", nullable: false),
                    HighSeverityAlertCount = table.Column<int>(type: "integer", nullable: false),
                    OutOfHoursEventCount = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_DataSentinelUserRiskProfiles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_ActorUser",
                table: "DataSentinelUserRiskProfiles",
                columns: new[] { "TenantId", "ActorUser" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_LastEvaluatedAt",
                table: "DataSentinelUserRiskProfiles",
                columns: new[] { "TenantId", "LastEvaluatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_RiskLevel",
                table: "DataSentinelUserRiskProfiles",
                columns: new[] { "TenantId", "RiskLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_DataSentinelUserRiskProfiles_TenantId_RiskScore",
                table: "DataSentinelUserRiskProfiles",
                columns: new[] { "TenantId", "RiskScore" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DataSentinelUserRiskProfiles");
        }
    }
}
