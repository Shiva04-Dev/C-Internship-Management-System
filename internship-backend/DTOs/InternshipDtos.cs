using System.ComponentModel.DataAnnotations;

namespace C__Internship_Management_Program.DTOs
{
    public class CreateInternshipDto
    {
        [Required, MaxLength(100)]
        public string Title { get; set; }

        [Required, MaxLength(4000)]
        public string Description { get; set; }

        [Required, MaxLength(100)]
        public string Location { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [Required, MaxLength(2000)]
        public string Requirements { get; set; }
    }

    public class UpdateInternshipDto
    {
        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(4000)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [MaxLength(2000)]
        public string? Requirements { get; set; }

        public string? Status { get; set; }
    }
}
