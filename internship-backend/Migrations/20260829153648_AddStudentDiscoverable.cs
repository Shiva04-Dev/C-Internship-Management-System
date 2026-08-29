using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace C__Internship_Management_Program.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentDiscoverable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDiscoverable",
                table: "Students",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Students_IsDiscoverable",
                table: "Students",
                column: "IsDiscoverable");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Students_IsDiscoverable",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "IsDiscoverable",
                table: "Students");
        }
    }
}
