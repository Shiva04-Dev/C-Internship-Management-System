using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Services;
using C__Internship_Management_Program.Seeders;
using Npgsql.EntityFrameworkCore.PostgreSQL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Auto-detect database type based on connection string
string connectionString;

if (builder.Environment.IsProduction())
{
    // Railway provides DATABASE_URL environment variable
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    connectionString = ConvertPostgresUrlToConnectionString(databaseUrl);

    Console.WriteLine("Using PostgreSQL (Railway)");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // Local development - use appsettings.json
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;

    Console.WriteLine("Using SQL Server (Local)");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// Register Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthenService, AuthenService>();

// Configure JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? builder.Configuration["Jwt:Issuer"];
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured!");
}

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
        ClockSkew = TimeSpan.Zero // Remove default 5 minute tolerance
    };
});

builder.Services.AddAuthorization();

// Configure Swagger/OpenAPI with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Internship Management API",
        Version = "v1",
        Description = "API for managing internships, students, and companies"
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token"
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

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",        // React dev server
            "http://localhost:5173",        // Vite dev server
            "http://localhost:4200"         // Angular dev server
            )
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();

        // Also allow Vercel deployments
        policy.SetIsOriginAllowed(origin =>
        {
            return origin.Contains("localhost") ||
                   origin.Contains("vercel.app") ||
                   origin.Contains("railway.app");
        });
    });
});

// Configure forwarded headers for Railway reverse proxy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// Use forwarded headers (Railway uses a reverse proxy)
app.UseForwardedHeaders();

// Always enable Swagger (useful for production debugging)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Internship Management API v1");
    c.RoutePrefix = "swagger";
});

// Only use HTTPS redirection in development
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS must come before Authentication/Authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database setup for production
if (app.Environment.IsProduction())
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Creating database and tables...");

        await context.Database.EnsureCreatedAsync();

        logger.LogInformation("Seeding database with demo data...");
        await DatabaseSeeder.SeedData(context);

        logger.LogInformation("Database setup completed successfully!");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error during database setup");
        // Don't throw - let the app start anyway so we can see errors in logs
    }
}

// Display startup information
var railwayUrl = Environment.GetEnvironmentVariable("RAILWAY_PUBLIC_DOMAIN");
var baseUrl = !string.IsNullOrEmpty(railwayUrl)
    ? $"https://{railwayUrl}"
    : (app.Environment.IsDevelopment() ? "https://localhost:7179" : "http://localhost:8080");

Console.WriteLine("\n" + new string('=', 60));
Console.WriteLine("Internship Management API is running!");
Console.WriteLine(new string('=', 60));
Console.WriteLine($"Environment:  {app.Environment.EnvironmentName}");
Console.WriteLine($"Swagger UI:   {baseUrl}/swagger");
Console.WriteLine($"API Base:     {baseUrl}/api");
Console.WriteLine(new string('=', 60) + "\n");

app.Run();

// Helper method to convert Railway DATABASE_URL to connection string
static string ConvertPostgresUrlToConnectionString(string? databaseUrl)
{
    if (string.IsNullOrEmpty(databaseUrl))
    {
        throw new InvalidOperationException(
            "DATABASE_URL environment variable is not set. " +
            "Make sure you have a PostgreSQL database attached in Railway.");
    }

    try
    {
        // Railway format: postgresql://username:password@host:port/database
        // or: postgres://username:password@host:port/database
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
    catch (Exception ex)
    {
        throw new InvalidOperationException(
            $"Failed to parse DATABASE_URL: {databaseUrl}. Error: {ex.Message}");
    }
}