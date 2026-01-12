using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class Internship
    {
        [Key]
        public int InternshipID { get; set; }

        [Required]
        public int CompanyID { get; set; }

        [ForeignKey(nameof(CompanyID))]
        public Company Company { get; set; }

        [Required, MaxLength(100)]
        public string Title { get; set; }

        public string Description { get; set; }

        [MaxLength(100)]
        public string Location { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [MaxLength(250)]
        public string Requirements { get; set; }

        [Required]
        public string Status { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        // Navigation
        public ICollection<Application> Applications { get; set; }
        public ICollection<Feedback> Feedbacks { get; set; }
    }
}
