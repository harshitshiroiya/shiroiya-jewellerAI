namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(string containerName, string fileName, byte[] data, string contentType);
    Task<string> UploadAsync(string containerName, string fileName, Stream stream, string contentType);
    Task DeleteAsync(string containerName, string fileName);
    string GetBlobUrl(string containerName, string fileName);
}
