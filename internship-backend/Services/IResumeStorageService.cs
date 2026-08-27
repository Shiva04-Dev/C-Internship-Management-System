namespace C__Internship_Management_Program.Services
{
    public interface IResumeStorageService
    {
        Task<string> SaveResumeAsync(IFormFile file, string objectName);

        // Returns null if the object doesn't exist.
        Task<Stream?> GetResumeAsync(string objectName);
    }
}
