using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using C__Internship_Management_Program.DTOs;
using C__Internship_Management_Program.Services;

namespace C__Internship_Management_Program.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenController : ControllerBase
    {
        private readonly IAuthenService _authService;

        public AuthenController(IAuthenService authService)
        {
            _authService = authService;
        }

        [HttpPost("register/student")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> RegisterStudent([FromBody] StudentRegisterDto dto)
        {
            try
            {
                var response = await _authService.RegisterStudentAsync(dto);
                return Ok(response);
            }
            catch (Exception)
            {
                // Matches ASP.NET's own validation-error shape so a duplicate email isn't
                // enumerable by response shape alone.
                ModelState.AddModelError(nameof(dto.EmailAddress), "Unable to create account with the provided details");
                return ValidationProblem(ModelState);
            }
        }

        [HttpPost("register/company")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> RegisterCompany([FromBody] CompanyRegisterDto dto)
        {
            try
            {
                var response = await _authService.RegisterCompanyAsync(dto);
                return Ok(response);
            }
            catch (Exception)
            {
                // See RegisterStudent above — same shape-matching rationale.
                ModelState.AddModelError(nameof(dto.Email), "Unable to create account with the provided details");
                return ValidationProblem(ModelState);
            }
        }

        // Requires an existing Admin; the first one comes from DatabaseSeeder.
        [HttpPost("register/admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegisterDto dto)
        {
            try
            {
                var response = await _authService.RegisterAdminAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login/student")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> LoginStudent([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto, "Student");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("login/company")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> LoginCompany([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto, "Company");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("login/admin")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> LoginAdmin([FromBody] LoginDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto, "Admin");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(dto.RefreshToken);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                var result = await _authService.RevokeRefreshTokenAsync(dto.RefreshToken);
                if (result)
                    return Ok(new { message = "Logged out successfully" });
                return BadRequest(new { message = "Invalid refresh token" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            return Ok(new
            {
                userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
                userType = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value,
                name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
            });
        }
    }
}
