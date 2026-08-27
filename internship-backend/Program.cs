using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Services;
using C__Internship_Management_Program.Seeders;
using C__Internship_Management_Program.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Database configuration - PostgreSQL
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. Set the DATABASE_URL environment variable " +
        "(production) or run 'dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"<value>\"' (local development).");
}

Console.WriteLine("Using PostgreSQL");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthenService, AuthenService>();

// Resume storage — GCS when RESUME_BUCKET_NAME is set (production; Cloud Run's own
// filesystem is ephemeral), local disk otherwise (local development, no GCP
// credentials required to run the app locally).
var resumeBucketName = Environment.GetEnvironmentVariable("RESUME_BUCKET_NAME");
if (!string.IsNullOrWhiteSpace(resumeBucketName))
{
    builder.Services.AddSingleton<IResumeStorageService>(new GcsResumeStorageService(resumeBucketName));
}
else
{
    builder.Services.AddSingleton<IResumeStorageService, LocalDiskResumeStorageService>();
}

// Configure JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "JWT signing key is not configured. Set the JWT_KEY environment variable " +
        "(production) or run 'dotnet user-secrets set \"Jwt:Key\" \"<value>\"' (local development).");
}

// JwtService reads Jwt:Key from IConfiguration directly to generate/validate tokens.
// A plain JWT_KEY env var doesn't auto-bind to config key "Jwt:Key" (.NET only does
// that for Jwt__Key), so without this, JwtService would silently see an empty key
// under a JWT_KEY-env-var deployment even though the check above just passed.
builder.Configuration["Jwt:Key"] = jwtKey;

var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? builder.Configuration["Jwt:Issuer"]
    ?? "InternshipManagementAPI";

var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? builder.Configuration["Jwt:Audience"]
    ?? "InternshipManagementClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Internship Management API",
        Version = "v1",
        Description = "API for managing internships, students, and companies"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS — scoped to known frontend origins rather than AllowAnyOrigin
var corsAllowedOrigins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
    ?? builder.Configuration["Cors:AllowedOrigins"]
    ?? "http://localhost:5173,https://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsAllowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure forwarded headers
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// Middleware
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Internship Management API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseMiddleware<BanCheckMiddleware>();
app.UseAuthorization();
app.MapControllers();

// Health check endpoints
app.MapGet("/", () => Results.Ok(new
{
    status = "running",
    message = "Internship Management API",
    swagger = "/swagger",
    timestamp = DateTime.UtcNow
}));

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

Console.WriteLine("\n" + new string('=', 60));
Console.WriteLine("  DATABASE SETUP");
Console.WriteLine(new string('=', 60));

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<ApplicationDbContext>();

    try
    {
        logger.LogInformation("Testing database connection...");
        if (!await context.Database.CanConnectAsync())
        {
            throw new Exception("Cannot connect to database");
        }
        logger.LogInformation("Connection successful!");

        logger.LogInformation("Applying migrations...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Migrations applied!");

        logger.LogInformation("Verifying tables...");

        var adminCount = await context.Admins.CountAsync();
        var studentCount = await context.Students.CountAsync();
        var companyCount = await context.Companies.CountAsync();
        var internshipCount = await context.Internships.CountAsync();

        logger.LogInformation("All tables verified!");

        // Seeds well-known demo credentials (DatabaseSeeder.cs) — Development only
        if (app.Environment.IsDevelopment())
        {
            logger.LogInformation("Seeding demo data...");
            await DatabaseSeeder.SeedData(context);
            logger.LogInformation("Seeding complete!");
        }
        else
        {
            logger.LogInformation("Skipping demo data seeding (not Development environment).");
        }

        // Final counts
        adminCount = await context.Admins.CountAsync();
        studentCount = await context.Students.CountAsync();
        companyCount = await context.Companies.CountAsync();
        internshipCount = await context.Internships.CountAsync();
        var applicationCount = await context.Applications.CountAsync();

        logger.LogInformation("   Final counts:");
        logger.LogInformation("   Admins: {Count}", adminCount);
        logger.LogInformation("   Students: {Count}", studentCount);
        logger.LogInformation("   Companies: {Count}", companyCount);
        logger.LogInformation("   Internships: {Count}", internshipCount);
        logger.LogInformation("   Applications: {Count}", applicationCount);

        Console.WriteLine("\n Database has been setup");
    }
    catch (Exception ex)
    {
        logger.LogError("Database Setup failed");
        logger.LogError("   Error: {Message}", ex.Message);
        if (ex.InnerException != null)
        {
            logger.LogError("   Inner: {Inner}", ex.InnerException.Message);
        }
        logger.LogError("   Stack: {Stack}", ex.StackTrace);
    }
}

Console.WriteLine(new string('=', 60) + "\n");

Console.WriteLine(new string('=', 60));
Console.WriteLine("Internship Management API is running!");
Console.WriteLine(new string('=', 60));
Console.WriteLine($"  Environment:  {app.Environment.EnvironmentName}");
Console.WriteLine($"  Database:     PostgreSQL");
Console.WriteLine($"  Swagger UI:   https://localhost:7179/swagger");
Console.WriteLine($"  Health:       https://localhost:7179/health");
Console.WriteLine(new string('=', 60) + "\n");

app.Run();
