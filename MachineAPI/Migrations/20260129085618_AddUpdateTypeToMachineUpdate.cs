using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdateTypeToMachineUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "farmers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FarmerId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RfId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SmsEnabled = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Bonus = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    SocietyId = table.Column<int>(type: "int", nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_farmers", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "machine_updates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SocietyId = table.Column<int>(type: "int", nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: true),
                    MachineType = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdateType = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CurrentVersion = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AvailableVersion = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdateStatus = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    LastChecked = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machine_updates", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "machines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineId = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MachineModel = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SocietyId = table.Column<int>(type: "int", nullable: false),
                    BmcId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsMasterMachine = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    LastSyncDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    InstallationDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machines", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "rate_charts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    society_id = table.Column<int>(type: "int", nullable: true),
                    bmc_id = table.Column<int>(type: "int", nullable: true),
                    channel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    fat_min = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    fat_max = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    snf_min = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    snf_max = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    rate_per_liter = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    bonus_per_liter = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    valid_from = table.Column<DateOnly>(type: "date", nullable: false),
                    valid_to = table.Column<DateOnly>(type: "date", nullable: true),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    priority = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rate_charts", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "societies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    SocietyId = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BmcId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_societies", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "machine_password_logs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    password_type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    old_password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    new_password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    changed_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    change_reason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ip_address = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_successful = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machine_password_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_machine_password_logs_machines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "milk_collections",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    farmer_id = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    society_id = table.Column<int>(type: "int", nullable: true),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    collection_date = table.Column<DateOnly>(type: "date", nullable: false),
                    collection_time = table.Column<TimeOnly>(type: "time(6)", nullable: false),
                    shift_type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    farmer_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    channel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    quantity = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    fat_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    snf_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    clr_value = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    protein_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    lactose_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    salt_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    water_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    temperature = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    rate_per_liter = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    bonus = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    machine_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    machine_version = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_milk_collections", x => x.id);
                    table.ForeignKey(
                        name: "FK_milk_collections_machines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "milk_dispatches",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    dispatch_id = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    society_id = table.Column<int>(type: "int", nullable: true),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    dispatch_date = table.Column<DateOnly>(type: "date", nullable: false),
                    dispatch_time = table.Column<TimeOnly>(type: "time(6)", nullable: false),
                    shift_type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    channel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    fat_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    snf_percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    clr_value = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    quantity = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    rate_per_liter = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    machine_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    machine_version = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_milk_dispatches", x => x.id);
                    table.ForeignKey(
                        name: "FK_milk_dispatches_machines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "milk_sales",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    count = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    society_id = table.Column<int>(type: "int", nullable: true),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    sales_date = table.Column<DateOnly>(type: "date", nullable: false),
                    sales_time = table.Column<TimeOnly>(type: "time(6)", nullable: false),
                    shift_type = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    channel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    quantity = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    rate_per_liter = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    customer_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    customer_phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    machine_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    machine_version = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_milk_sales", x => x.id);
                    table.ForeignKey(
                        name: "FK_milk_sales_machines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "machine_statistics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    SocietyId = table.Column<int>(type: "int", nullable: false),
                    TotalTest = table.Column<int>(type: "int", nullable: false),
                    DailyCleaning = table.Column<int>(type: "int", nullable: false),
                    WeeklyCleaning = table.Column<int>(type: "int", nullable: false),
                    CleaningSkip = table.Column<int>(type: "int", nullable: false),
                    Gain = table.Column<int>(type: "int", nullable: false),
                    AutoChannel = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StatisticsDate = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    StatisticsTime = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RecordedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_machine_statistics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_machine_statistics_machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_machine_statistics_societies_SocietyId",
                        column: x => x.SocietyId,
                        principalTable: "societies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "idx_farmer_id",
                table: "farmers",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "farmers",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "idx_rf_id",
                table: "farmers",
                column: "RfId");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "farmers",
                column: "SocietyId");

            migrationBuilder.CreateIndex(
                name: "idx_status",
                table: "farmers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "idx_created_at",
                table: "machine_password_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "machine_password_logs",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "idx_password_type",
                table: "machine_password_logs",
                column: "password_type");

            migrationBuilder.CreateIndex(
                name: "idx_created_at",
                table: "machine_statistics",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "idx_machine_date",
                table: "machine_statistics",
                columns: new[] { "MachineId", "StatisticsDate" });

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "machine_statistics",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "idx_recorded_at",
                table: "machine_statistics",
                column: "RecordedAt");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "machine_statistics",
                column: "SocietyId");

            migrationBuilder.CreateIndex(
                name: "idx_statistics_date",
                table: "machine_statistics",
                column: "StatisticsDate");

            migrationBuilder.CreateIndex(
                name: "idx_created_at",
                table: "machine_updates",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "machine_updates",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "idx_update_type",
                table: "machine_updates",
                column: "UpdateType");

            migrationBuilder.CreateIndex(
                name: "idx_is_master",
                table: "machines",
                column: "IsMasterMachine");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "machines",
                column: "MachineId");

            migrationBuilder.CreateIndex(
                name: "idx_machine_type",
                table: "machines",
                column: "MachineType");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "machines",
                column: "SocietyId");

            migrationBuilder.CreateIndex(
                name: "idx_status",
                table: "machines",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "idx_collection_date",
                table: "milk_collections",
                column: "collection_date");

            migrationBuilder.CreateIndex(
                name: "idx_farmer_id",
                table: "milk_collections",
                column: "farmer_id");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "milk_collections",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "idx_shift_type",
                table: "milk_collections",
                column: "shift_type");

            migrationBuilder.CreateIndex(
                name: "idx_society_date",
                table: "milk_collections",
                columns: new[] { "society_id", "collection_date" });

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "milk_collections",
                column: "society_id");

            migrationBuilder.CreateIndex(
                name: "idx_dispatch_date",
                table: "milk_dispatches",
                column: "dispatch_date");

            migrationBuilder.CreateIndex(
                name: "idx_dispatch_id",
                table: "milk_dispatches",
                column: "dispatch_id");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "milk_dispatches",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "idx_shift_type",
                table: "milk_dispatches",
                column: "shift_type");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "milk_dispatches",
                column: "society_id");

            migrationBuilder.CreateIndex(
                name: "idx_count",
                table: "milk_sales",
                column: "count");

            migrationBuilder.CreateIndex(
                name: "idx_machine_id",
                table: "milk_sales",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "idx_sales_date",
                table: "milk_sales",
                column: "sales_date");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "milk_sales",
                column: "society_id");

            migrationBuilder.CreateIndex(
                name: "idx_bmc_id",
                table: "rate_charts",
                column: "bmc_id");

            migrationBuilder.CreateIndex(
                name: "idx_channel",
                table: "rate_charts",
                column: "channel");

            migrationBuilder.CreateIndex(
                name: "idx_is_active",
                table: "rate_charts",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "rate_charts",
                column: "society_id");

            migrationBuilder.CreateIndex(
                name: "idx_valid_from",
                table: "rate_charts",
                column: "valid_from");

            migrationBuilder.CreateIndex(
                name: "idx_valid_to",
                table: "rate_charts",
                column: "valid_to");

            migrationBuilder.CreateIndex(
                name: "idx_bmc_id",
                table: "societies",
                column: "BmcId");

            migrationBuilder.CreateIndex(
                name: "idx_society_id",
                table: "societies",
                column: "SocietyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "farmers");

            migrationBuilder.DropTable(
                name: "machine_password_logs");

            migrationBuilder.DropTable(
                name: "machine_statistics");

            migrationBuilder.DropTable(
                name: "machine_updates");

            migrationBuilder.DropTable(
                name: "milk_collections");

            migrationBuilder.DropTable(
                name: "milk_dispatches");

            migrationBuilder.DropTable(
                name: "milk_sales");

            migrationBuilder.DropTable(
                name: "rate_charts");

            migrationBuilder.DropTable(
                name: "societies");

            migrationBuilder.DropTable(
                name: "machines");
        }
    }
}
