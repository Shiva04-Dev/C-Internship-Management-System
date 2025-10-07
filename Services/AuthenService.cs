using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using C__Internship_Management_Program.Data;
using C__Internship_Management_Program.Models;
using C__Internship_Management_Program.DTOs;
using BCrypt.Net;
using System.CodeDom.Compiler;

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
            if (await _context.Students.AnySync(s => s.Email == dto.Email))
                throw new Exception("Email Exists");

            var student = new Student
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.EmailAddress,
                PasswordHash = BCrypt.Net.BCrypt.HashPasssword(dto.Password),
                PhoneNumber = dto.PhoneNumber,
                University = dto.University,
                Degree = dto.Degree,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return await GenerateAuthenticationResponse(student.StudentID, student.Email, "Student", $"{student.FirstName} {student.LastName}");
        }
    }
}
