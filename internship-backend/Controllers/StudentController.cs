using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.DTOs;
using C__Internship_Management_Program.Extensions;
using C__Internship_Management_Program.Services;
using System.Security.Claims;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IResumeStorageService _resumeStorage;

        public StudentController(ApplicationDbContext context, IResumeStorageService resumeStorage)
        {
            _context = context;
            _resumeStorage = resumeStorage;
        }

        // GET: api/Student/resume - Whether the logged-in student has a base CV on file
        [HttpGet("resume")]
        public async Task<IActionResult> GetMyResume()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(new { hasBaseResume = !string.IsNullOrEmpty(student.BaseResumePath) });
        }

        // POST: api/Student/resume - Upload or replace the base CV
        [HttpPost("resume")]
        public async Task<IActionResult> UploadMyResume([FromForm] UploadBaseResumeDto dto)
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            var validationError = await dto.Resume.ValidateAsResumeAsync();
            if (validationError != null)
                return BadRequest(new { message = validationError });

            var newObjectName = $"base_{studentId}_{Guid.NewGuid()}.pdf";
            await _resumeStorage.SaveResumeAsync(dto.Resume, newObjectName);

            // Commit the new path before deleting the old blob — if anything
            // fails between these two steps, the DB still points at a real
            // file (the new one) rather than one that's already gone.
            var oldObjectName = student.BaseResumePath;
            student.BaseResumePath = newObjectName;
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(oldObjectName))
                await _resumeStorage.DeleteResumeAsync(oldObjectName);

            return Ok(new { message = "Base CV uploaded" });
        }

        // DELETE: api/Student/resume - Remove the base CV
        [HttpDelete("resume")]
        public async Task<IActionResult> DeleteMyResume()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            if (string.IsNullOrEmpty(student.BaseResumePath))
                return BadRequest(new { message = "No base CV on file" });

            var objectName = student.BaseResumePath;
            student.BaseResumePath = null;
            await _context.SaveChangesAsync();

            await _resumeStorage.DeleteResumeAsync(objectName);

            return Ok(new { message = "Base CV removed" });
        }

        // GET: api/Student/discoverable - Whether the student is opted in to company search
        [HttpGet("discoverable")]
        public async Task<IActionResult> GetMyDiscoverable()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(new { isDiscoverable = student.IsDiscoverable });
        }

        // PUT: api/Student/discoverable - Opt in or out of company search
        [HttpPut("discoverable")]
        public async Task<IActionResult> UpdateMyDiscoverable([FromBody] UpdateDiscoverableDto dto)
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound(new { message = "Student not found" });

            student.IsDiscoverable = dto.IsDiscoverable;
            await _context.SaveChangesAsync();

            return Ok(new { isDiscoverable = student.IsDiscoverable });
        }

        // GET: api/Student/resume/download - Download the logged-in student's own base CV
        [HttpGet("resume/download")]
        public async Task<IActionResult> DownloadMyResume()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var student = await _context.Students.FindAsync(studentId);
            if (student == null || string.IsNullOrEmpty(student.BaseResumePath))
                return NotFound(new { message = "No base CV on file" });

            var stream = await _resumeStorage.GetResumeAsync(student.BaseResumePath);
            if (stream == null)
                return NotFound(new { message = "Resume file not found" });

            return File(stream, "application/pdf", student.BaseResumePath);
        }
    }
}
