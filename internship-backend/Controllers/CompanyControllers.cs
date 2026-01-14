using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using System.Security.Claims;
using C__Internship_Management_Program.Models.DTOs;

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

        // POST: api/Company/ban-student/{studentId}
        [HttpPost("ban-student/{studentId}")]
        public async Task<IActionResult> BanStudent(int studentId, [FromBody] BanReasonDto dto)
        {
            try
            {
                var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // Check if already banned
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error banning student", error = ex.Message });
            }
        }

        // POST: api/Company/unban-student/{studentId}
        [HttpPost("unban-student/{studentId}")]
        public async Task<IActionResult> UnbanStudent(int studentId)
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error unbanning student", error = ex.Message });
            }
        }

        // GET: api/Company/banned-students
        [HttpGet("banned-students")]
        public async Task<IActionResult> GetBannedStudents()
        {
            try
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching banned students", error = ex.Message });
            }
        }
    }
}