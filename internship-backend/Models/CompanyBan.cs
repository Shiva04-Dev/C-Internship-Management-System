using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.Models
{
    public class CompanyBan
    {
        [Key]
        public int BanID { get; set; }

        [Required]
        public int CompanyID { get; set; }

        [ForeignKey(nameof(CompanyID))]
        public Company Company { get; set; }

        [Required]
        public int StudentID { get; set; }

        [ForeignKey(nameof(StudentID))]
        public Student Student { get; set; }

        public DateTime BannedAt { get; set; } = DateTime.UtcNow;

        public string Reason { get; set; }
    }
}