using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class UploadBaseResumeDto
    {
        [Required]
        public IFormFile Resume { get; set; }
    }
}
