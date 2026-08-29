using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace C__Internship_Management_Program.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentBaseResume : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BaseResumePath",
                table: "Students",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BaseResumePath",
                table: "Students");
        }
    }
}
