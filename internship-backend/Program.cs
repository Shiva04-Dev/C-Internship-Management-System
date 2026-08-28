using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi.Models;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Services;
using C__Internship_Management_Program.Middleware;
using C__Internship_Management_Program.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. Set the DATABASE_URL environment variable " +
        "(production) or run 'dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"<value>\"' (local development).");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthenService, AuthenService>();
builder.Services.AddResumeStorage();

// JWT signing key must come from an env var or user-secrets — never a hardcoded default.
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "JWT signing key is not configured. Set the JWT_KEY environment variable " +
        "(production) or run 'dotnet user-secrets set \"Jwt:Key\" \"<value>\"' (local development).");
}

// A JWT_KEY env var doesn't auto-bind to config key "Jwt:Key" (only JWT__Key would),
// so JwtService needs it bridged in here manually.
builder.Configuration["Jwt:Key"] = jwtKey;

builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddFrontendCors(builder.Configuration);
builder.Services.AddApplicationRateLimiting();

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

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// Order matters: exception handling must wrap everything else.
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSecurityHeaders();
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
app.UseRateLimiter();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    status = "running",
    message = "Internship Management API",
    swagger = "/swagger",
    timestamp = DateTime.UtcNow
}));

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

await app.ApplyMigrationsAndSeedAsync();

Console.WriteLine($"Internship Management API running — {app.Environment.EnvironmentName}, PostgreSQL");

app.Run();
