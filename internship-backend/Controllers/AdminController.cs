using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        //GET: api/Admin/dashboard - Get overall system stats
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var totalStudents = await _context.Students.CountAsync();
                var totalCompanies = await _context.Companies.CountAsync();
                var totalInternships = await _context.Internships.CountAsync();
                var activeInternships = await _context.Internships.CountAsync(i => i.Status == "Active");
                var totalApplications = await _context.Applications.CountAsync();
                var pendingApplications = await _context.Applications.CountAsync(a => a.Status == "Pending");

                //Recent Activity
                var recentInternships = await _context.Internships
                    .Include(i => i.Company)
                    .OrderByDescending(i => i.CreatedAt)
                    .Take(5)
                    .Select(i => new
                    {
                        i.InternshipID,
                        i.Title,
                        CompanyName = i.Company.CompanyName,
                        i.Location,
                        i.Status,
                        i.CreatedAt
                    })
                    .ToListAsync();

                var recentApplications = await _context.Applications
                    .Include(a => a.Student)
                    .Include(a => a.Internship)
                    .OrderByDescending(a => a.AppliedAt)
                    .Take(5)
                    .Select(a => new
                    {
                        a.ApplicationID,
                        StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                        InternshipTitle = a.Internship.Title,
                        a.Status,
                        a.AppliedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    stats = new
                    {
                        totalStudents,
                        totalCompanies,
                        totalInternships,
                        activeInternships,
                        totalApplications,
                        pendingApplications
                    },
                    recentInternships,
                    recentApplications
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching dashboard", error = ex.Message });
            }
        }

        //GET: api/dmin/students - Get all students
        [HttpGet("students")]
        public async Task<IActionResult> GetAllStudents(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var totalCount = await _context.Students.CountAsync();

                var students = await _context.Students
                    .Include(s => s.Applications)
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(s => new
                    {
                        s.StudentID,
                        s.FirstName,
                        s.LastName,
                        s.Email,
                        s.PhoneNumber,
                        s.University,
                        s.Degree,
                        s.CreatedAt,
                        ApplicationCount = s.Applications.Count
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    students
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching students", error = ex.Message });
            }
        }

        //GET: api/Admin/companies - Get all companies
        [HttpGet("companies")]
        public async Task<IActionResult> GetAllCompanies(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var totalCount = await _context.Companies.CountAsync();

                var companies = await _context.Companies
                    .Include(c => c.Internships)
                    .OrderByDescending(c => c.UpdatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        c.CompanyID,
                        c.CompanyName,
                        c.Email,
                        c.PhoneNumber,
                        c.Website,
                        c.UpdatedAt,
                        InternshipCount = c.Internships.Count,
                        ActiveInternships = c.Internships.Count(i => i.Status == "Active")
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    companies
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching companies", error = ex.Message });
            }
        }

        //GET: api/Admin/Interships - Get all internships with filters
        [HttpGet("internships")]
        public async Task<IActionResult> GetAllInternships(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Internships.Include(i => i.Company).AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(i => i.Status == status);
                }

                var totalCount = await query.CountAsync();

                var internships = await query
                    .OrderByDescending(i => i.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(i => new
                    {
                        i.InternshipID,
                        i.Title,
                        i.Location,
                        i.StartDate,
                        i.EndDate,
                        i.Status,
                        i.CreatedAt,
                        CompanyName = i.Company.CompanyName,
                        ApplicationCount = i.Applications.Count
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    internships
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching internships", error = ex.Message });
            }
        }

        //GET: api/Admin/applications - Get all aplications with filters
        [HttpGet("applications")]
        public async Task<IActionResult> GetAllApplications(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Applications
                    .Include(a => a.Student)
                    .Include(a => a.Internship)
                    .ThenInclude(i => i.Company)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(a => a.Status == status);
                }

                var totalCount = await query.CountAsync();

                var applications = await query
                    .OrderByDescending(a => a.AppliedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        a.ApplicationID,
                        StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                        StudentEmail = a.Student.Email,
                        InternshipTitle = a.Internship.Title,
                        CompanyName = a.Internship.Company.CompanyName,
                        a.Status,
                        a.AppliedAt,
                        a.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalCount,
                    currentPage = page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    applications
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching applications", error = ex.Message });
            }
        }

        //DELETE: api/Admin/internship/{id} - Force close/delete internship
        [HttpDelete("internship/{id}")]
        public async Task<IActionResult> ForceCloseInternship(int id)
        {
            try
            {
                var internship = await _context.Internships.FindAsync(id);

                if (internship == null)
                    return NotFound(new { message = "Internship not found" });

                internship.Status = "Closed";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Internship close by an Admin" });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error closing internship", error = ex.Message });
            }
        }

        //GET: api/Admin/reports - Get summary reports
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            try
            {
                //Applications by status
                var applicationsByStatus = await _context.Applications
                    .GroupBy(a => a.Status)
                    .Select(g => new { status = g.Key, count = g.Count() })
                    .ToListAsync();

                //Internhips by status
                var internshipsByStatus = await _context.Internships
                    .GroupBy(i => i.Status)
                    .Select(g => new { status = g.Key, count = g.Count() })
                    .ToListAsync();

                //Top companies by internships posted
                var topCompanies = await _context.Companies
                    .Include(c => c.Internships)
                    .OrderByDescending(c => c.Internships.Count)
                    .Take(5)
                    .Select(c => new
                    {
                        c.CompanyName,
                        internshipCount = c.Internships.Count,
                        activeInternships = c.Internships.Count(i => i.Status == "Active")
                    })
                    .ToListAsync();

                //Top students by applications submitted
                var topStudents = await _context.Students
                    .Include(s => s.Applications)
                    .OrderByDescending(s => s.Applications.Count)
                    .Take(5)
                    .Select(s => new
                    {
                        studentName = $"{s.FirstName} {s.LastName}",
                        applicationCount = s.Applications.Count,
                        acceptedCount = s.Applications.Count(a => a.Status == "Accepted")
                    })
                    .ToListAsync();

                //Applications over time(-30days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var applicationsOverTime = await _context.Applications
                    .Where(a => a.AppliedAt >= thirtyDaysAgo)
                    .GroupBy(a => a.AppliedAt.Date)
                    .Select(g => new { date = g.Key, count = g.Count() })
                    .OrderBy(x => x.date)
                    .ToListAsync();

                return Ok(new
                {
                    applicationsByStatus,
                    internshipsByStatus,
                    topCompanies,
                    topStudents,
                    applicationsOverTime
                });
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating reports", error = ex.Message });
            }
        }
    }
}