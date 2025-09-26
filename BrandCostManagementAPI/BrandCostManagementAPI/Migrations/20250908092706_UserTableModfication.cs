using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrandCostManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class UserTableModfication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "Users",
                type: "ENUM('admin','manager','finance','hr','viewer')",
                maxLength: 20,
                nullable: false,
                defaultValue: "viewer",
                oldClrType: typeof(string),
                oldType: "ENUM('admin','brand_manager','employee','viewer')",
                oldMaxLength: 20,
                oldDefaultValue: "viewer")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "role",
                table: "Users",
                type: "ENUM('admin','brand_manager','employee','viewer')",
                maxLength: 20,
                nullable: false,
                defaultValue: "viewer",
                oldClrType: typeof(string),
                oldType: "ENUM('admin','manager','finance','hr','viewer')",
                oldMaxLength: 20,
                oldDefaultValue: "viewer")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
