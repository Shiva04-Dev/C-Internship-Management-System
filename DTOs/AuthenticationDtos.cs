using System;
using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class StudentRegisterDto
    {
        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string EmailAddress { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }

        [Required, MaxLength(15)]
        public string PhoneNumber { get; set; }

        public string University { get; set; }
        public string Degree { get; set; }
    }

    public class CompanyRegisterDto
    {
        [Required, MaxLength(50)]
        public string CompanyName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }

        [Required, MaxLength(15)]
        public string PhoneNumber { get; set; }

        public string Website { get; set; }
    }

    public class AdminRegisterDto
    {
        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class AuthenticationResponseDto
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string UserType { get; set; }
        public string UserID { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
