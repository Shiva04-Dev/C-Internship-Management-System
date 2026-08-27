using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.DTOs;
using C__Internship_Management_Program.Extensions;
using C__Internship_Management_Program.Models;
using System.Security.Claims;

namespace C__Internship_Management_Program.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class InternshipController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public InternshipController(ApplicationDbContext context)
		{
			_context = context;
		}

		//GET: api/Internship - Get all active internships (public access for student to view)
		[HttpGet]
		public async Task<IActionResult> GetAllInternships(
			[FromQuery] string? location = null,
			[FromQuery] string? title = null)
		{
			var query = _context.Internships
				.Include(i => i.Company)
				.Where(i => i.Status == "Active");

			//Apply filters if provided by the User
			if (!string.IsNullOrEmpty(location))
			{
				query = query.Where(i => i.Location.Contains(location));
			}

			if (!string.IsNullOrEmpty(title))
			{
				query = query.Where(i => i.Title.Contains(title));
			}

			var internships = await query
				.Select(i => new
				{
					i.InternshipID,
					i.Title,
					i.Description,
					i.Location,
					i.StartDate,
					i.EndDate,
					i.Requirements,
					i.Status,
					i.CreatedAt,
					Company = new
					{
						i.Company.CompanyID,
						i.Company.CompanyName,
						i.Company.Website
					}
				})
				.OrderByDescending(i => i.CreatedAt)
				.ToListAsync();

			return Ok(internships);
		}

        // GET: api/Internship/{id} - Get specific internship details
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInternshipById(int id)
        {
            var isAuthenticatedStudent = User.Identity?.IsAuthenticated == true && User.IsInRole("Student");

            var internship = await _context.Internships
                .Include(i => i.Company)
                .Where(i => i.InternshipID == id)
                .Select(i => new
                {
                    i.InternshipID,
                    i.Title,
                    i.Description,
                    i.Location,
                    i.StartDate,
                    i.EndDate,
                    i.Requirements,
                    i.Status,
                    i.CreatedAt,
                    Company = new
                    {
                        i.Company.CompanyID,
                        i.Company.CompanyName,
                        // Contact PII only goes to authenticated students — everyone
                        // else (anonymous callers, companies, admins) gets the same
                        // reduced shape the public list endpoint already uses.
                        Email = isAuthenticatedStudent ? i.Company.Email : null,
                        PhoneNumber = isAuthenticatedStudent ? i.Company.PhoneNumber : null,
                        i.Company.Website
                    }
                })
                .FirstOrDefaultAsync();

            if (internship == null)
                return NotFound(new { message = "Internship not found" });

            return Ok(internship);
        }

        //GET: api/Internship/company/mine - Get all internships for the logged-in company
        [HttpGet("company/mine")]
		[Authorize(Roles = "Company")]
		public async Task<IActionResult> GetMyCompanyInternships()
		{
			//Get the Compnay ID from the JWT Token
			var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

			var internships = await _context.Internships
				.Where(i => i.CompanyID == companyId)
				.Include(i => i.Applications)
				.Select(i => new
				{
					i.InternshipID,
					i.Title,
					i.Description,
					i.Location,
					i.StartDate,
					i.EndDate,
					i.Requirements,
					i.Status,
					i.CreatedAt,
					ApplicationCount = i.Applications.Count,
					PendingApplications = i.Applications.Count(a => a.Status == "Pending")
				})
				.OrderByDescending(i => i.CreatedAt)
				.ToListAsync();

			return Ok(internships);
		}

		//POST: api/Internship - Create new internship (Only Companies can)
		[HttpPost]
		[Authorize(Roles = "Company")]
		public async Task<IActionResult> CreateInternship([FromBody] CreateInternshipDto dto)
		{
			//Get company ID from JWT Token
			var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

			var company = await _context.Companies.FindAsync(companyId);
			if (company == null)
				return NotFound(new { message = "Company not found" });

			if (!company.IsApproved)
				return StatusCode(403, new { message = "Your company account is pending admin approval. You'll be able to post internships once approved." });

			var startDate = dto.StartDate.EnsureUtc();
			var endDate = dto.EndDate.EnsureUtc();

			//Validate Dates
			if (startDate >= endDate)
				return BadRequest(new { message = "End Date must be after the Start Date" });

			if (startDate < DateTime.UtcNow.Date)
				return BadRequest(new { message = "Start Date can't be in the past" });

			var internship = new Internship
			{
				CompanyID = companyId,
				Title = dto.Title,
				Description = dto.Description,
				Location = dto.Location,
				StartDate = startDate,
				EndDate = endDate,
				Requirements = dto.Requirements,
				Status = "Active",
				CreatedAt = DateTime.UtcNow
			};

			_context.Internships.Add(internship);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetInternshipById),
				new { id = internship.InternshipID },
				new { message = "Internship created successfully", internshipId = internship.InternshipID });
		}

		//PUT: api/Internship/{id} - Update Internships (Only done by Companies, to their own internships)
		[HttpPut("{id}")]
		[Authorize(Roles = "Company")]
		public async Task<IActionResult> UpdateInternship(int id, [FromBody] UpdateInternshipDto dto)
		{
			var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

			var internship = await _context.Internships
				.FirstOrDefaultAsync(i => i.InternshipID == id && i.CompanyID == companyId);

			if (internship == null)
				return NotFound(new { message = "Internship not found or you do not have the necessary permissions to edit" });

			//Validate dates if provided
			var startDate = dto.StartDate?.EnsureUtc() ?? internship.StartDate;
			var endDate = dto.EndDate?.EnsureUtc() ?? internship.EndDate;

			if (startDate >= endDate)
				return BadRequest(new { message = "End date must be after the start date" });

			var validStatuses = new[] { "Active", "Closed" };
			if (dto.Status != null && !validStatuses.Contains(dto.Status))
				return BadRequest(new { message = "Invalid status" });

			//Update fields
			internship.Title = dto.Title ?? internship.Title;
			internship.Description = dto.Description ?? internship.Description;
			internship.Location = dto.Location ?? internship.Location;
			internship.StartDate = startDate;
			internship.EndDate = endDate;
			internship.Requirements = dto.Requirements ?? internship.Requirements;
			internship.Status = dto.Status ?? internship.Status;

			await _context.SaveChangesAsync();

			return Ok(new { message = "Internship updated successfully" });
		}

		//DELETE: api/Internship/{id} - Delete/Close Internship (By Companies Only)
		[HttpDelete("{id}")]
		[Authorize(Roles = "Company")]
		public async Task<IActionResult> DeleteInternship(int id)
		{
			var companyId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

			var internship = await _context.Internships
				.FirstOrDefaultAsync(i => i.InternshipID == id && i.CompanyID == companyId);

			if (internship == null)
				return NotFound(new { message = "Internship not found or you do not have the necessary permissions to delete" });

			//Soft delete by setting status to Closed
			internship.Status = "Closed";
			await _context.SaveChangesAsync();

			return Ok(new { message = "Internship Closed" });
		}
	}
}
