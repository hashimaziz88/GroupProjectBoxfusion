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
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceSystem",
                table: "DataSentinelActivityEvents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.Sql(
                @"UPDATE ""DataSentinelActivityEvents""
                  SET ""SourceSystem"" = COALESCE(NULLIF(""SourceSystem"", ''), 'LegacyActivityEvent'),
                      ""SourceEventKey"" = COALESCE(NULLIF(""SourceEventKey"", ''), ""Id""::text);");

            migrationBuilder.AlterColumn<string>(
                name: "SourceEventKey",
                table: "DataSentinelActivityEvents",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SourceSystem",
                table: "DataSentinelActivityEvents",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64,
                oldNullable: true);

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
