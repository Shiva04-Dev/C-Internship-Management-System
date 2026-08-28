namespace C__Internship_Management_Program.Services
{
    // Local development only — Cloud Run's filesystem is ephemeral in production.
    public class LocalDiskResumeStorageService : IResumeStorageService
    {
        private readonly string _uploadsFolder;

        public LocalDiskResumeStorageService()
        {
            _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
            if (!Directory.Exists(_uploadsFolder))
                Directory.CreateDirectory(_uploadsFolder);
        }

        public async Task<string> SaveResumeAsync(IFormFile file, string objectName)
        {
            var filePath = Path.Combine(_uploadsFolder, objectName);
            using var fileStream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(fileStream);
            return objectName;
        }

        public Task<Stream?> GetResumeAsync(string objectName)
        {
            var filePath = Path.Combine(_uploadsFolder, objectName);
            if (!File.Exists(filePath))
                return Task.FromResult<Stream?>(null);

            Stream stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return Task.FromResult<Stream?>(stream);
        }
    }
}
