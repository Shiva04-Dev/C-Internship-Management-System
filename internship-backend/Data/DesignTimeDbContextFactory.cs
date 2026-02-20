using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace C__Internship_Management_Program.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Always use SQL Server for migrations
            var connectionString = "Server=localhost;Database=InternshipsDB;Trusted_Connection=True;TrustServerCertificate=True;";
            optionsBuilder.UseSqlServer(connectionString);
            Console.WriteLine("Using SQL Server for migrations");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}