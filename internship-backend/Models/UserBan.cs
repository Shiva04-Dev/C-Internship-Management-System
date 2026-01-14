using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class UserBan
    {
        [Key]
        public int BanID { get; set; }

        [Required]
        public string UserType { get; set; } // "Student" or "Company"

        public int? StudentID { get; set; }
        [ForeignKey(nameof(StudentID))]
        public Student Student { get; set; }

        public int? CompanyID { get; set; }
        [ForeignKey(nameof(CompanyID))]
        public Company Company { get; set; }

        public DateTime BannedAt { get; set; } = DateTime.UtcNow;

        public string Reason { get; set; }

        public bool IsActive { get; set; } = true;
    }
}