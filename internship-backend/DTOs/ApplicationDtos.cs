using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class SubmitApplicationWithResumeDto
    {
        [Required]
        public int InternshipID { get; set; }

        // Optional when UseBaseResume is true — the controller enforces
        // exactly one resume source is provided.
        public IFormFile? Resume { get; set; }

        public bool UseBaseResume { get; set; }
    }

    public class UpdateApplicationStatusDto
    {
        public string Status { get; set; }
    }
}
