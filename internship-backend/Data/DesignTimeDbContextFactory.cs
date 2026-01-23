using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace C__Internship_Management_Program.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Check for DATABASE_URL (PostgreSQL)
            var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (!string.IsNullOrEmpty(databaseUrl))
            {
                var connectionString = ConvertPostgresUrl(databaseUrl);
                optionsBuilder.UseNpgsql(connectionString);
                Console.WriteLine("Using PostgreSQL for migrations");
            }
            else
            {
                // Fallback to SQL Server for local development
                var connectionString = "Server=(localdb)\\mssqllocaldb;Database=InternshipDb;Trusted_Connection=True;";
                optionsBuilder.UseSqlServer(connectionString);
                Console.WriteLine("Using SQL Server for migrations");
            }

            return new ApplicationDbContext(optionsBuilder.Options);
        }

        private static string ConvertPostgresUrl(string databaseUrl)
        {
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo[0];
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        }
    }
}