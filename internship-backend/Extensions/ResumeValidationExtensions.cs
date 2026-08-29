namespace C__Internship_Management_Program.Extensions
{
    public static class ResumeValidationExtensions
    {
        private const long MaxResumeBytes = 5 * 1024 * 1024; // 5MB

        // Returns null if valid, otherwise a user-facing error message.
        public static async Task<string?> ValidateAsResumeAsync(this IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return "A resume file is required";

            if (file.Length > MaxResumeBytes)
                return "Resume file must be 5MB or smaller";

            // Verify the file is actually a PDF by its magic bytes ("%PDF-"), not just its declared name/content-type
            var header = new byte[5];
            using var stream = file.OpenReadStream();
            var bytesRead = await stream.ReadAsync(header, 0, header.Length);
            var isPdf = bytesRead == header.Length &&
                header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46 && header[4] == 0x2D;

            return isPdf ? null : "Resume must be a valid PDF file";
        }
    }
}
