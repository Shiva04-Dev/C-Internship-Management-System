using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace C__Internship_Management_Program.Models
{
    public class Student
    {
        [Key]
        public int StudentID { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; }

        [Required, MaxLength(50)]
        public string PasswordHash { get; set; }

        [MaxLength(15)]
        public string PhoneNumber { get; set; }

        public string University { get; set; }

        public string Degree { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        //Navigation
        public ICollection<Application> Applications { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
