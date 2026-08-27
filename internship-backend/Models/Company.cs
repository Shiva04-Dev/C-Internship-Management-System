using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace C__Internship_Management_Program.Models
{
    public class Company
    {
        [Key]
        public int CompanyID { get; set; }

        [Required, MaxLength(100)]
        public string CompanyName { get; set; }

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; }

        [Required, MaxLength(255)]
        public string PasswordHash { get; set; }

        [MaxLength(15)]
        public string PhoneNumber { get; set; }

        public string Website { get; set; }

        // New companies start unapproved and can't post internships until an admin
        // approves them (see InternshipController.CreateInternship) — closes the
        // fake-company resume-harvesting path a pentest found. Existing companies
        // are backfilled to true by the migration; see ApplicationDbContext.
        public bool IsApproved { get; set; }

        public DateTime UpdatedAt { get; set; }

        //Navigation
        public ICollection<Internship> Internships { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
