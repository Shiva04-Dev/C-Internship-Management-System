using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Seeders;
using Microsoft.EntityFrameworkCore;

namespace C__Internship_Management_Program.Extensions
{
    public static class WebApplicationExtensions
    {
        // Applies pending EF Core migrations at startup and, in Development only,
        // seeds demo data. Failures are logged, not rethrown — matches prior behavior
        // of letting the app continue starting even if this step fails.
        public static async Task ApplyMigrationsAndSeedAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();
            var context = services.GetRequiredService<ApplicationDbContext>();

            try
            {
                logger.LogInformation("Testing database connection...");
                if (!await context.Database.CanConnectAsync())
                    throw new Exception("Cannot connect to database");

                logger.LogInformation("Applying migrations...");
                await context.Database.MigrateAsync();

                if (app.Environment.IsDevelopment())
                {
                    logger.LogInformation("Seeding demo data...");
                    await DatabaseSeeder.SeedData(context);
                }
                else
                {
                    logger.LogInformation("Skipping demo data seeding (not Development environment).");
                }

                logger.LogInformation(
                    "Database ready. Admins: {Admins}, Students: {Students}, Companies: {Companies}, Internships: {Internships}, Applications: {Applications}",
                    await context.Admins.CountAsync(),
                    await context.Students.CountAsync(),
                    await context.Companies.CountAsync(),
                    await context.Internships.CountAsync(),
                    await context.Applications.CountAsync());
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Database setup failed");
            }
        }
    }
}
