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

        [Required, MaxLength(50)]
        public string PasswordHash { get; set; }

        [MaxLength(15)]
        public string PhoneNumber { get; set; }

        public string Website { get; set; }

        public DateTime UpdatedAt { get; set; }

        //Navigation
        public ICollection<Internship> Internships { get; set; }
    }
}
