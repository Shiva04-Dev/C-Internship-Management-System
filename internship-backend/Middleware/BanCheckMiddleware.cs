using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;

namespace C__Internship_Management_Program.Middleware
{
    /// <summary>
    /// Rejects every request from an authenticated Student/Company that has an active
    /// UserBan. Without this, a still-valid access token keeps authenticating for up to
    /// its full remaining lifetime after an admin bans the account, since JWT validation
    /// alone has no way to know about a ban that happened after the token was issued.
    /// </summary>
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
