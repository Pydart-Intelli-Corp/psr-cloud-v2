using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMachineCorrectionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "machine_corrections_from_machine",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    society_id = table.Column<int>(type: "int", nullable: false),
                    machine_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    channel1_fat = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel1_snf = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel1_clr = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel1_temp = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel1_water = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel1_protein = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_fat = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_snf = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_clr = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_temp = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_water = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel2_protein = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_fat = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_snf = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_clr = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_temp = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_water = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    channel3_protein = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machine_corrections_from_machine", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "machine_corrections_from_machine",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "idx_machine_society",
                table: "machine_corrections_from_machine",
                columns: new[] { "machine_id", "society_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "machine_corrections_from_machine",
                column: "society_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "machine_corrections_from_machine");
        }
    }
}
