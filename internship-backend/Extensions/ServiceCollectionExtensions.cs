using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using C__Internship_Management_Program.Services;

namespace C__Internship_Management_Program.Extensions
{
    public static class ServiceCollectionExtensions
    {
        // Expects Program.cs to have already resolved and validated Jwt:Key.
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtKey = configuration["Jwt:Key"];
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? configuration["Jwt:Issuer"] ?? "InternshipManagementAPI";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? configuration["Jwt:Audience"] ?? "InternshipManagementClient";

            services.AddAuthentication(options =>
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

            services.AddAuthorization();
            return services;
        }

        public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration configuration)
        {
            var corsAllowedOrigins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
                ?? configuration["Cors:AllowedOrigins"]
                ?? "http://localhost:5173,https://localhost:5173")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(corsAllowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            return services;
        }

        // Fixed-window limiter keyed by client IP, applied via [EnableRateLimiting("auth")].
        public static IServiceCollection AddApplicationRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy("auth", context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = 10,
                            Window = TimeSpan.FromMinutes(1),
                            QueueLimit = 0
                        }));
            });

            return services;
        }

        // GCS when RESUME_BUCKET_NAME is set (production; Cloud Run's own filesystem is
        // ephemeral), local disk otherwise (local development, no GCP credentials required).
        public static IServiceCollection AddResumeStorage(this IServiceCollection services)
        {
            var resumeBucketName = Environment.GetEnvironmentVariable("RESUME_BUCKET_NAME");
            if (!string.IsNullOrWhiteSpace(resumeBucketName))
            {
                services.AddSingleton<IResumeStorageService>(new GcsResumeStorageService(resumeBucketName));
            }
            else
            {
                services.AddSingleton<IResumeStorageService, LocalDiskResumeStorageService>();
            }

            return services;
        }
    }
}
