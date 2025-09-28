using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class Application
    {
        [Key]
        public int ApplicationID { get; set; }

        [Required]
        public int InternshipID { get; set; }

        [ForeignKey(nameof(InternshipID))]
        public Internship Internship { get; set; }

        [Required]
        public int StudentID { get; set; }

        [ForeignKey(nameof(StudentID))]
        public Student Student { get; set; }

        [Required]
        public string Status { get; set; }

        [Required]
        public DateTime AppliedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [MaxLength(255)]
        public string Resume { get; set; }
    }
}
