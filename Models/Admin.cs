using System;
using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.Models
{
    public class Admin
    {
        [Key]
        public int AdminID { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; }

        [Required, MaxLength(50)]
        public string PasswordHash { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
