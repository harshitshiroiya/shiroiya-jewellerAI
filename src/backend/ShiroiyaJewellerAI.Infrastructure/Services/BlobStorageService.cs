using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using ShiroiyaJewellerAI.Application.Common.Interfaces;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient? _blobServiceClient;
    private readonly string _baseUrl;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"];
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            _blobServiceClient = new BlobServiceClient(connectionString);
        }
        _baseUrl = configuration["AzureStorage:BaseUrl"] ?? "";
    }

    public async Task<string> UploadAsync(string containerName, string fileName, byte[] data, string contentType)
    {
        if (_blobServiceClient == null)
            throw new InvalidOperationException("Azure Blob Storage is not configured. Set AzureStorage:ConnectionString.");

        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(fileName);
        using var stream = new MemoryStream(data);
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType });

        return blobClient.Uri.ToString();
    }

    public async Task<string> UploadAsync(string containerName, string fileName, Stream stream, string contentType)
    {
        if (_blobServiceClient == null)
            throw new InvalidOperationException("Azure Blob Storage is not configured. Set AzureStorage:ConnectionString.");

        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string containerName, string fileName)
    {
        if (_blobServiceClient == null) return;

        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.DeleteIfExistsAsync();
    }

    public string GetBlobUrl(string containerName, string fileName)
    {
        return $"{_baseUrl}/{containerName}/{fileName}";
    }
}
