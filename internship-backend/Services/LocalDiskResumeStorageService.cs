namespace C__Internship_Management_Program.Services
{
    // Local-disk resume storage — local development only. Not used in production
    // (Cloud Run's filesystem is ephemeral; see GcsResumeStorageService). Preserves
    // the exact folder layout the app used before persistent storage was added, so
    // no extra setup is required to run the backend locally.
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
