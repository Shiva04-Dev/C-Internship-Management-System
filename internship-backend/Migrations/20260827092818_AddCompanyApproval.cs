using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace C__Internship_Management_Program.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Companies",
                type: "boolean",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Companies");
        }
    }
}
