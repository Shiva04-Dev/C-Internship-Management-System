using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using C__Internship_Management_Program.DTOs;
using BCrypt.Net;
using System.CodeDom.Compiler;
using Microsoft.Identity.Client;

namespace C__Internship_Management_Program.Services
{
    public interface IAuthenService
    {
        Task<AuthenticationResponseDto> RegisterStudentAsync(StudentRegisterDto dto);
        Task<AuthenticationResponseDto> RegisterCompanyAsync(CompanyRegisterDto dto);
        Task<AuthenticationResponseDto> RegisterAdminAsync(AdminRegisterDto dto);
        Task<AuthenticationResponseDto> LoginAsync(LoginDto dto, string userType);
        Task<AuthenticationResponseDto> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    }

    public class AuthenService : IAuthenService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthenService(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthenticationResponseDto> RegisterStudentAsync(StudentRegisterDto dto)
        {

            //Checking if student's email exists
            if (await _context.Students.AnyAsync(s => s.Email == dto.EmailAddress))
                throw new Exception("Email Exists");

            var student = new Student
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.EmailAddress,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                University = dto.University,
                Degree = dto.Degree,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return await GenerateAuthenticationResponse(student.StudentID, student.Email, "Student", $"{student.FirstName} {student.LastName}");
        }

        public async Task<AuthenticationResponseDto> RegisterCompanyAsync(CompanyRegisterDto dto)
        {
            if (await _context.Companies.AnyAsync(c => c.Email == dto.Email))
                throw new Exception("Email Exists");

            var company = new Company
            {
                CompanyName = dto.CompanyName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                Website = dto.Website,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return await GenerateAuthenticationResponse(company.CompanyID, company.Email, "Company", company.CompanyName);
        }

        public async Task<AuthenticationResponseDto> RegisterAdminAsync(AdminRegisterDto dto)
        {
            if (await _context.Admins.AnyAsync(c => c.Email == dto.Email))
                throw new Exception("Email Exists");

            var admin = new Admin
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                UpdatedAt = DateTime.UtcNow
            };

            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            return await GenerateAuthenticationResponse(admin.AdminID, admin.Email, "Admin", $"{admin.FirstName} {admin.LastName}");
        }

        public async Task<AuthenticationResponseDto> LoginAsync(LoginDto dto, string userType)
        {
            switch (userType.ToLower())
            {
                case "student":
                    var student = await _context.Students.FirstOrDefaultAsync(s => s.Email == dto.Email);
                    if (student == null || !BCrypt.Net.BCrypt.Verify(dto.Password, student.PasswordHash))
                        throw new Exception("Invalid Email or Password");
                    return await GenerateAuthenticationResponse(student.StudentID, student.Email, "Student", $"{student.FirstName} {student.LastName}");

                case "company":
                    var company = await _context.Companies.FirstOrDefaultAsync(c => c.Email == dto.Email);
                    if (company == null || !BCrypt.Net.BCrypt.Verify(dto.Password, company.PasswordHash))
                        throw new Exception("Invalid Email or Password");
                    return await GenerateAuthenticationResponse(company.CompanyID, company.Email, "Company", company.CompanyName);

                case "admin":
                    var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == dto.Email);
                    if (admin == null || !BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
                        throw new Exception("Invalid Email or Password");
                    return await GenerateAuthenticationResponse(admin.AdminID, admin.Email, "Admin", $"{admin.FirstName} {admin.LastName}");

                default:
                    throw new Exception("Invalid User Type");
            }
        }

        public async Task<AuthenticationResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.Student)
                .Include(rt => rt.Company)
                .Include(rt => rt.Admin)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null || !storedToken.IsActive)
                throw new Exception("Invalid or Exipred Token");

            //Revoking old token
            storedToken.IsRevoked = true;

            //Generate new tokens based on type of user
            string name = "";
            string email = "";
            int userId = 0;

            if (storedToken.UserType == "Student")
            {
                userId = storedToken.StudentID.Value;
                email = storedToken.Student.Email;
                name = $"{storedToken.Student.FirstName} {storedToken.Student.LastName}";
            }
            else if (storedToken.UserType == "Company")
            {
                userId = storedToken.CompanyID.Value;
                email = storedToken.Company.Email;
                name = storedToken.Company.CompanyName;
            }
            else if (storedToken.UserType == "Admin")
            {
                userId = storedToken.AdminID.Value;
                email = storedToken.Admin.Email;
                name = $"{storedToken.Admin.FirstName} {storedToken.Admin.LastName}";
            }

            await _context.SaveChangesAsync();

            return await GenerateAuthenticationResponse(userId, email, storedToken.UserType, name);
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            var token = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            if (token == null) return false;

            token.IsRevoked = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<AuthenticationResponseDto> GenerateAuthenticationResponse(int userId, string email, string userType, string name)
        {
            var accessToken = _jwtService.GenerateAccessToken(userId, email, userType, name);
            var refreshToken = _jwtService.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                UserType = userType,
                CreatedByIP = "127.0.0.1"
            };

            //Sets appropriate user ID based on type
            if (userType == "Student") refreshTokenEntity.StudentID = userId;
            else if (userType == "Company") refreshTokenEntity.CompanyID = userId;
            else if (userType == "Admin") refreshTokenEntity.AdminID = userId;

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new AuthenticationResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserType = userType,
                UserID = userId,
                Email = email,
                Name = name,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60)
            };
        }
    }
}
