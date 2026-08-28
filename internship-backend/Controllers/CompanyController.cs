using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.DTOs;
using C__Internship_Management_Program.Models;
using System.Security.Claims;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Company")]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Company/me - The logged-in company's own profile/approval status
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                return NotFound(new { message = "Company not found" });

            return Ok(new { company.CompanyID, company.CompanyName, company.IsApproved });
        }

        // POST: api/Company/ban-student/{studentId}
        [HttpPost("ban-student/{studentId}")]
        public async Task<IActionResult> BanStudent(int studentId, [FromBody] BanReasonDto dto)
        {
            var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            var existingBan = await _context.CompanyBans
                .FirstOrDefaultAsync(b => b.CompanyID == companyId && b.StudentID == studentId);

            if (existingBan != null)
                return BadRequest(new { message = "Student is already banned" });

            var ban = new CompanyBan
            {
                CompanyID = companyId,
                StudentID = studentId,
                BannedAt = DateTime.UtcNow,
                Reason = dto.Reason
            };

            _context.CompanyBans.Add(ban);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student banned successfully" });
        }

        // POST: api/Company/unban-student/{studentId}
        [HttpPost("unban-student/{studentId}")]
        public async Task<IActionResult> UnbanStudent(int studentId)
        {
            var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var ban = await _context.CompanyBans
                .FirstOrDefaultAsync(b => b.CompanyID == companyId && b.StudentID == studentId);

            if (ban == null)
                return NotFound(new { message = "Ban not found" });

            _context.CompanyBans.Remove(ban);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student unbanned successfully" });
        }

        // GET: api/Company/banned-students
        [HttpGet("banned-students")]
        public async Task<IActionResult> GetBannedStudents()
        {
            var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var bannedStudents = await _context.CompanyBans
                .Include(b => b.Student)
                .Where(b => b.CompanyID == companyId)
                .Select(b => new
                {
                    banId = b.BanID,
                    studentId = b.StudentID,
                    studentName = $"{b.Student.FirstName} {b.Student.LastName}",
                    studentEmail = b.Student.Email,
                    bannedAt = b.BannedAt,
                    reason = b.Reason
                })
                .ToListAsync();

            return Ok(bannedStudents);
        }

        // GET: api/Company/application-stats - Applicant status breakdown across all of this company's internships
        [HttpGet("application-stats")]
        public async Task<IActionResult> GetApplicationStats()
        {
            var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var applicationsByStatus = await _context.Applications
                .Where(a => a.Internship.CompanyID == companyId)
                .GroupBy(a => a.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync();

            return Ok(new { applicationsByStatus });
        }
    }
}
