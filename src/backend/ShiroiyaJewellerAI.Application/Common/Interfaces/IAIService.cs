using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IAIService
{
    IAsyncEnumerable<AIStreamChunk> ChatStreamAsync(string userId, Guid conversationId, string userMessage);
    Task<string> GenerateDesignImageAsync(string description);
}

public record AIStreamChunk(string Type, string Content);
