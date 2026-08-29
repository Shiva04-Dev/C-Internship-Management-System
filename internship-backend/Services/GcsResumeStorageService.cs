using Google;
using Google.Cloud.Storage.V1;
using System.Net;

namespace C__Internship_Management_Program.Services
{
    // Persistent resume storage backed by Google Cloud Storage. Used whenever
    // RESUME_BUCKET_NAME is configured (production) — see Program.cs registration.
    public class GcsResumeStorageService : IResumeStorageService
    {
        private readonly StorageClient _storageClient;
        private readonly string _bucketName;

        public GcsResumeStorageService(string bucketName)
        {
            _bucketName = bucketName;
            _storageClient = StorageClient.Create();
        }

        public async Task<string> SaveResumeAsync(IFormFile file, string objectName)
        {
            using var stream = file.OpenReadStream();
            await _storageClient.UploadObjectAsync(_bucketName, objectName, "application/pdf", stream);
            return objectName;
        }

        public async Task<string> CopyResumeAsync(string sourceObjectName, string destObjectName)
        {
            await _storageClient.CopyObjectAsync(_bucketName, sourceObjectName, _bucketName, destObjectName);
            return destObjectName;
        }

        public async Task DeleteResumeAsync(string objectName)
        {
            try
            {
                await _storageClient.DeleteObjectAsync(_bucketName, objectName);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
            }
        }

        public async Task<Stream?> GetResumeAsync(string objectName)
        {
            var memory = new MemoryStream();
            try
            {
                await _storageClient.DownloadObjectAsync(_bucketName, objectName, memory);
            }
            catch (GoogleApiException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            memory.Position = 0;
            return memory;
        }
    }
}
