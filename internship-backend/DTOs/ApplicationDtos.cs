using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class SubmitApplicationWithResumeDto
    {
        [Required]
        public int InternshipID { get; set; }

        [Required]
        public IFormFile Resume { get; set; }
    }

    public class UpdateApplicationStatusDto
    {
        public string Status { get; set; }
    }
}
