using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using System.Security.Claims;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApplicationController(ApplicationDbContext context)
        {
            _context = context;
        }

        //GET: api/Application/student/mine - Get all applications for logged-in student
        [HttpGet("student/mine")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyApplications()
        {
            try
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

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching applications", error = ex.Message });
            }
        }

        //GET: api/Application/internship/{internshipId} - Get all applications for a specific internship (Company/Admin only)
        [HttpGet("internship/{internshipId}")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> GetApplicationsForInternship(int internshipId)
        {
            try
            {
                //Verifies if the internship is owned by the company
                if (User.IsInRole("Company"))
                {
                    var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                    var internship = await _context.Internships
                        .FirstOrDefaultAsync(i => i.InternshipID == internshipId && i.CompanyID == companyId);

                    if (internship == null)
                        return Forbid(); //The internship does not belong to the company
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

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching applications", error = ex.Message });
            }
        }

        //POST: api/application/with-resume - Submit Application (Only by Students)
        [HttpPost("with-resume")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitApplication([FromBody] SubmitApplicationWithResumeDto dto)
        {
            try
            {
                var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                //Check if the internship exists and is open
                var internship = await _context.Internships
                    .FirstOrDefaultAsync(i => i.InternshipID == dto.InternshipID && i.Status == "Active");

                if (internship == null)
                    return NotFound(new { message = "Internship could not be found or is no longer active" });

                //Check if the student has already applied
                var existingApplication = await _context.Applications
                    .FirstOrDefaultAsync(a => a.InternshipID == dto.InternshipID && a.StudentID == studentId);

                if (existingApplication != null)
                    return BadRequest(new { message = "You have already applied to this internship" });

                string resumePath = null;
                if (dto.Resume != null)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{studentId}_{dto.InternshipID}_{Guid.NewGuid()}.pdf";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Resume.CopyToAsync(fileStream);
                    }

                    resumePath = uniqueFileName;
                }

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

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error submitting the application", error = ex.Message });
            }
        }

        //PUT: api/Appliction/{id} - Update Application Status (By the Company/Admin Only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusDto dto)
        {
            try
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
                        return Forbid(); //Internship does not belong to the company
                }

                //Validate status
                var validStatuses = new[] { "Pending", "Accepted", "Rejected", "Withdrawn" };

                if (!validStatuses.Contains(dto.Status))
                    return BadRequest(new { message = "Invalid Status" });

                application.Status = dto.Status;
                application.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = $"Application Status updated to {dto.Status}" });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating application status", error = ex.Message });
            }
        }


        // GET: api/Application/download-resume/{applicationId}
        [HttpGet("download-resume/{applicationId}")]
        [Authorize(Roles = "Company, Admin")]
        public async Task<IActionResult> DownloadResume(int applicationId)
        {
            try
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

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes", application.Resume);

                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { message = "Resume file not found" });

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                return File(memory, "application/pdf", application.Resume);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error downloading resume", error = ex.Message });
            }
        }

        //DELETE: api/Application/{id} - Withdraw Application (By the Student Only, of their own applications)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> WithdrawApplication(int id)
        {
            try
            {
                var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                var application = await _context.Applications
                    .FirstOrDefaultAsync(a => a.ApplicationID == id && a.StudentID == studentId);

                if (application == null)
                    return NotFound(new { message = "Application not found" });

                //Only pending applications can be withdrawn
                if (application.Status != "Pending")
                    return BadRequest(new { message = "Only allowed to withdraw pending applications" });

                application.Status = "Withdrawn";
                application.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Application Withdrawn" });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error withdrawing application", error = ex.Message });
            }
        }

        //GET: api/Application/stats - Get Application Statistics (Admin Only)
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetApplicationStats()
        {
            try
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

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching the stats", error = ex.Message });
            }
        }
    }

    //DTOs for Application operations
    public class SubmitApplicationWithResumeDto
    {
        public int InternshipID { get; set; }
        public IFormFile Resume { get; set; }
    }

    public class UpdateApplicationStatusDto
    {
        public string Status { get; set; }
    }
}