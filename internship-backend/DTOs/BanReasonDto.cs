using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class BanReasonDto
    {
        [Required, MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}
