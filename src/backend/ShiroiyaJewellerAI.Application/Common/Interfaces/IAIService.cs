using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IAIService
{
    IAsyncEnumerable<AIStreamChunk> ChatStreamAsync(string userId, Guid conversationId, string userMessage);
    Task<string> GenerateDesignImageAsync(string description);
    Task<string> TryOnAsync(string userPhotoBase64, string jewelleryPhotoBase64, string jewelleryType);
    Task<DesignGenerationResult> GenerateDesignAsync(string prompt, string? style, string? referenceImageBase64);
    Task<DesignGenerationResult> RefineDesignAsync(string baseImageBase64, string modification);
    Task<DesignGenerationResult> EditDesignRegionAsync(string imageBase64, string maskBase64, string prompt);
}

public record AIStreamChunk(string Type, string Content);
public record DesignGenerationResult(List<GeneratedImage> Images);
public record GeneratedImage(string Id, string ImageUrl);
