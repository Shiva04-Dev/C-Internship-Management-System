using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace C__Internship_Management_Program.Models
{
    public class RefreshToken
    {
        [Key]
        public int RefreshTokenID { get; set; }

        [Required, MaxLength(64)]
        public string Token { get; set; }

        //Lifecycle
        [Required]
        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
        public bool IsRevoked { get; set; } = false;

        [MaxLength(45)]
        public string CreatedByIP { get; set; }

        //User Type and ID
        [MaxLength(20)]
        public string UserType { get;set; }

        [Required]
        public int? StudentID { get; set; }
        public Student Student { get; set; }

        [Required]
        public int? CompanyID { get; set; }
        public Company Company  { get; set; }

        [Required]
        public int? AdminID { get; set; }
        public Admin Admin { get; set; }

        //Convenience Flags
        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
