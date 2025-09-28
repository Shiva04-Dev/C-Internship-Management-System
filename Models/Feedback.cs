using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class Feedback
    {
        [Key]
        public int FeedbackID { get; set; }

        [Required]
        public int InternshipID { get; set; }

        [ForeignKey(nameof(InternshipID))]
        public Internship Internship { get; set; }

        [Required]
        public int StudentID { get; set; }

        [ForeignKey(nameof(StudentID))]
        public Student Student { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }
    }
}
