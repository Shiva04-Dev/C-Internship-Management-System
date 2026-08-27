using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace C__Internship_Management_Program.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Design-time only (dotnet ef migrations add/update) — always targets the local
            // Postgres dev container, never a real environment's connection string.
            var connectionString = "Host=localhost;Port=5433;Database=IntershipsDB;Username=postgres;Password=devpassword";
            optionsBuilder.UseNpgsql(connectionString);
            Console.WriteLine("Using PostgreSQL for migrations");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}