using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;

namespace C__Internship_Management_Program.Middleware
{
    // Rejects requests from a Student/Company with an active UserBan — otherwise a
    // still-valid token keeps working until it expires, even after being banned.
    public class BanCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public BanCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userType = context.User.FindFirst("UserType")?.Value;
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(userIdClaim, out var userId) &&
                    (userType == "Student" || userType == "Company"))
                {
                    var isBanned = userType == "Student"
                        ? await db.UserBans.AnyAsync(b => b.StudentID == userId && b.IsActive)
                        : await db.UserBans.AnyAsync(b => b.CompanyID == userId && b.IsActive);

                    if (isBanned)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { message = "Your account has been suspended. Please contact support." });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
