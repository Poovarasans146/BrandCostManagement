using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrandCostManagementAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddContractDocumentName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "contract_document_name",
                table: "Project",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "contract_document_name",
                table: "Project");
        }
    }
}
