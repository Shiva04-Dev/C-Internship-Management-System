using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.DTOs;
using C__Internship_Management_Program.Models;
using C__Internship_Management_Program.Services;
using System.Security.Claims;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IResumeStorageService _resumeStorage;

        public ApplicationController(ApplicationDbContext context, IResumeStorageService resumeStorage)
        {
            _context = context;
            _resumeStorage = resumeStorage;
        }

        // GET: api/Application/student/mine - Get all applications for logged-in student
        [HttpGet("student/mine")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyApplications()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var applications = await _context.Applications
                .Include(a => a.Internship)
                .ThenInclude(i => i.Company)
                .Where(a => a.StudentID == studentId)
                .Select(a => new
                {
                    a.ApplicationID,
                    a.Status,
                    a.AppliedAt,
                    a.UpdatedAt,
                    a.Resume,
                    Internship = new
                    {
                        a.Internship.InternshipID,
                        a.Internship.Title,
                        a.Internship.Location,
                        a.Internship.StartDate,
                        a.Internship.EndDate,
                        CompanyName = a.Internship.Company.CompanyName
                    }
                })
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/Application/internship/{internshipId} - Get all applications for a specific internship
        [HttpGet("internship/{internshipId}")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> GetApplicationsForInternship(int internshipId)
        {
            // Verify if the internship is owned by the company
            if (User.IsInRole("Company"))
            {
                var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var internship = await _context.Internships
                    .FirstOrDefaultAsync(i => i.InternshipID == internshipId && i.CompanyID == companyId);

                if (internship == null)
                    return Forbid();
            }

            var applications = await _context.Applications
                .Include(a => a.Student)
                .Where(a => a.InternshipID == internshipId)
                .Select(a => new
                {
                    a.ApplicationID,
                    a.Status,
                    a.AppliedAt,
                    a.UpdatedAt,
                    a.Resume,
                    Student = new
                    {
                        a.Student.StudentID,
                        a.Student.FirstName,
                        a.Student.LastName,
                        a.Student.Email,
                        a.Student.PhoneNumber,
                        a.Student.University,
                        a.Student.Degree
                    }
                })
                .OrderByDescending(a => a.AppliedAt)
                .ToListAsync();

            return Ok(applications);
        }

        // POST: api/Application/with-resume - Submit application with resume
        [HttpPost("with-resume")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitApplicationWithResume([FromForm] SubmitApplicationWithResumeDto dto)
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Check if internship exists and is active
            var internship = await _context.Internships
                .FirstOrDefaultAsync(i => i.InternshipID == dto.InternshipID && i.Status == "Active");

            if (internship == null)
                return NotFound(new { message = "Internship not found or is no longer active" });

            // Respect a company's ban of this student before accepting an application to their internship
            var isBannedByCompany = await _context.CompanyBans
                .AnyAsync(b => b.CompanyID == internship.CompanyID && b.StudentID == studentId);

            if (isBannedByCompany)
                return Forbid();

            // Check if already applied
            var existingApplication = await _context.Applications
                .FirstOrDefaultAsync(a => a.InternshipID == dto.InternshipID && a.StudentID == studentId);

            if (existingApplication != null)
                return BadRequest(new { message = "You have already applied to this internship" });

            if (dto.Resume == null || dto.Resume.Length == 0)
                return BadRequest(new { message = "A resume file is required" });

            const long maxResumeBytes = 5 * 1024 * 1024; // 5MB
            if (dto.Resume.Length > maxResumeBytes)
                return BadRequest(new { message = "Resume file must be 5MB or smaller" });

            // Verify the file is actually a PDF by its magic bytes ("%PDF-"), not just its declared name/content-type
            var header = new byte[5];
            using (var headerStream = dto.Resume.OpenReadStream())
            {
                var bytesRead = await headerStream.ReadAsync(header, 0, header.Length);
                var isPdf = bytesRead == header.Length &&
                    header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46 && header[4] == 0x2D;

                if (!isPdf)
                    return BadRequest(new { message = "Resume must be a valid PDF file" });
            }

            // Save resume file (Google Cloud Storage in production, local disk for
            // local dev — see IResumeStorageService registration in Program.cs)
            var uniqueFileName = $"{studentId}_{dto.InternshipID}_{Guid.NewGuid()}.pdf";
            await _resumeStorage.SaveResumeAsync(dto.Resume, uniqueFileName);

            string resumePath = uniqueFileName;

            var application = new Application
            {
                InternshipID = dto.InternshipID,
                StudentID = studentId,
                Status = "Pending",
                AppliedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Resume = resumePath
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Application Submitted",
                applicationId = application.ApplicationID
            });
        }

        // PUT: api/Application/{id}/status - Update application status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusDto dto)
        {
            var application = await _context.Applications
                .Include(a => a.Internship)
                .FirstOrDefaultAsync(a => a.ApplicationID == id);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            if (User.IsInRole("Company"))
            {
                var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                if (application.Internship.CompanyID != companyId)
                    return Forbid();
            }

            // Validate status
            var validStatuses = new[] { "Pending", "Accepted", "Rejected", "Withdrawn" };
            if (!validStatuses.Contains(dto.Status))
                return BadRequest(new { message = "Invalid status" });

            application.Status = dto.Status;
            application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Application status updated to {dto.Status}" });
        }

        // GET: api/Application/download-resume/{applicationId}
        [HttpGet("download-resume/{applicationId}")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> DownloadResume(int applicationId)
        {
            var application = await _context.Applications
                .Include(a => a.Internship)
                .FirstOrDefaultAsync(a => a.ApplicationID == applicationId);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            // Verify company owns the internship (if company role)
            if (User.IsInRole("Company"))
            {
                var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                if (application.Internship.CompanyID != companyId)
                    return Forbid();
            }

            if (string.IsNullOrEmpty(application.Resume))
                return NotFound(new { message = "Resume not found" });

            var stream = await _resumeStorage.GetResumeAsync(application.Resume);
            if (stream == null)
                return NotFound(new { message = "Resume file not found" });

            return File(stream, "application/pdf", application.Resume);
        }

        // DELETE: api/Application/{id} - Withdraw application
        [HttpDelete("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> WithdrawApplication(int id)
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.ApplicationID == id && a.StudentID == studentId);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            // Only pending applications can be withdrawn
            if (application.Status != "Pending")
                return BadRequest(new { message = "Only pending applications can be withdrawn" });

            application.Status = "Withdrawn";
            application.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application withdrawn" });
        }

        // GET: api/Application/stats - Get application statistics
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetApplicationStats()
        {
            var totalApplications = await _context.Applications.CountAsync();
            var pendingApplications = await _context.Applications.CountAsync(a => a.Status == "Pending");
            var acceptedApplications = await _context.Applications.CountAsync(a => a.Status == "Accepted");
            var rejectedApplications = await _context.Applications.CountAsync(a => a.Status == "Rejected");

            var recentApplications = await _context.Applications
                .Include(a => a.Student)
                .Include(a => a.Internship)
                .ThenInclude(i => i.Company)
                .OrderByDescending(a => a.AppliedAt)
                .Take(10)
                .Select(a => new
                {
                    a.ApplicationID,
                    StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                    InternshipTitle = a.Internship.Title,
                    CompanyName = a.Internship.Company.CompanyName,
                    a.Status,
                    a.AppliedAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalApplications,
                pendingApplications,
                acceptedApplications,
                rejectedApplications,
                recentApplications
            });
        }
    }
}
