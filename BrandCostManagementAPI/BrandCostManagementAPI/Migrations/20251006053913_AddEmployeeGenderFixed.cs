using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrandCostManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeGenderFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "gender",
                table: "Employees",
                type: "ENUM('Male','Female','Transgender')",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "gender",
                table: "Employees");
        }
    }
}
