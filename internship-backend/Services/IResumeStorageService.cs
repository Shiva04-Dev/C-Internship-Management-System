namespace C__Internship_Management_Program.Services
{
    public interface IResumeStorageService
    {
        Task<string> SaveResumeAsync(IFormFile file, string objectName);

        // Server-side copy so applying with a base CV freezes an independent
        // object for that application, rather than pointing at the base CV.
        Task<string> CopyResumeAsync(string sourceObjectName, string destObjectName);

        // No-op if the object doesn't exist.
        Task DeleteResumeAsync(string objectName);

        // Returns null if the object doesn't exist.
        Task<Stream?> GetResumeAsync(string objectName);
    }
}
