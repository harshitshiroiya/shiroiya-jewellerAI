using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using OpenAI.Images;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly ApplicationDbContext _context;
    private readonly ChatClient _chatClient;
    private readonly ImageClient _imageClient;
    private readonly IBlobStorageService _blobStorage;

    private static readonly ChatTool SearchInventoryTool = ChatTool.CreateFunctionTool(
        "search_inventory",
        "Search jewellery inventory by filters",
        BinaryData.FromString("""
        {
            "type": "object",
            "properties": {
                "jewelleryType": { "type": "string", "enum": ["Ring", "Earring", "Necklace", "Bracelet", "Pendant", "Bangle"] },
                "metalType": { "type": "string", "enum": ["Gold", "Silver", "Platinum", "RoseGold", "WhiteGold"] },
                "stoneType": { "type": "string", "enum": ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "None"] },
                "minPrice": { "type": "number" },
                "maxPrice": { "type": "number" },
                "occasion": { "type": "string" }
            }
        }
        """));

    private static readonly ChatTool GenerateDesignTool = ChatTool.CreateFunctionTool(
        "generate_design_image",
        "Generate a custom jewellery design image based on description",
        BinaryData.FromString("""
        {
            "type": "object",
            "properties": {
                "description": { "type": "string", "description": "Detailed description of the jewellery design to generate" }
            },
            "required": ["description"]
        }
        """));

    private const string SystemPrompt = """
        You are a luxury jewellery consultant for Shiroiya Jewellers. You help customers find the perfect jewellery piece.

        When a customer describes what they're looking for (occasion, recipient, style, budget), use the search_inventory function
        to find matching pieces from our collection. If nothing matches or the customer wants something unique, use
        generate_design_image to create a custom design visualization.

        Be warm, knowledgeable about jewellery (metals, stones, craftsmanship), and guide customers toward the best choices.
        Always ask clarifying questions about budget, metal preference, stone preference, and occasion if not provided.
        Respond in a conversational, helpful tone. Keep responses concise but informative.
        """;

    public AIService(IConfiguration configuration, ApplicationDbContext context, IBlobStorageService blobStorage)
    {
        _context = context;
        _blobStorage = blobStorage;

        var endpoint = configuration["AzureOpenAI:Endpoint"]!;
        var apiKey = configuration["AzureOpenAI:ApiKey"]!;
        var chatDeployment = configuration["AzureOpenAI:ChatDeployment"] ?? "gpt-4o";
        var imageDeployment = configuration["AzureOpenAI:ImageDeployment"] ?? "dall-e-3";

        var azureClient = new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(apiKey));
        _chatClient = azureClient.GetChatClient(chatDeployment);
        _imageClient = azureClient.GetImageClient(imageDeployment);
    }

    public async IAsyncEnumerable<AIStreamChunk> ChatStreamAsync(string userId, Guid conversationId, string userMessage)
    {
        var conversation = await _context.AIConversations.FindAsync(conversationId);
        if (conversation == null)
        {
            conversation = new Domain.Entities.AIConversation { Id = conversationId, UserId = userId };
            _context.AIConversations.Add(conversation);
        }

        var history = JsonSerializer.Deserialize<List<ChatMessageRecord>>(conversation.MessagesJson) ?? [];
        history.Add(new ChatMessageRecord("user", userMessage));

        var messages = new List<ChatMessage> { new SystemChatMessage(SystemPrompt) };
        foreach (var msg in history.TakeLast(20))
        {
            if (msg.Role == "user") messages.Add(new UserChatMessage(msg.Content));
            else if (msg.Role == "assistant") messages.Add(new AssistantChatMessage(msg.Content));
        }

        var options = new ChatCompletionOptions();
        options.Tools.Add(SearchInventoryTool);
        options.Tools.Add(GenerateDesignTool);

        var response = _chatClient.CompleteChatAsync(messages, options).GetAwaiter().GetResult();

        if (response.Value.FinishReason == ChatFinishReason.ToolCalls)
        {
            foreach (var toolCall in response.Value.ToolCalls)
            {
                if (toolCall.FunctionName == "search_inventory")
                {
                    var args = JsonSerializer.Deserialize<JsonElement>(toolCall.FunctionArguments.ToString());
                    var products = await SearchInventoryAsync(args);
                    var productsJson = JsonSerializer.Serialize(products.Select(p => new { p.Id, p.Name, p.SellingPrice, p.MetalType, p.StoneType, p.ImageUrls }));

                    messages.Add(new AssistantChatMessage(new[] { ChatToolCall.CreateFunctionToolCall(toolCall.Id, toolCall.FunctionName, toolCall.FunctionArguments) }));
                    messages.Add(new ToolChatMessage(toolCall.Id, productsJson));

                    foreach (var p in products)
                    {
                        if (!conversation.RecommendedProductIds.Contains(p.Id))
                            conversation.RecommendedProductIds.Add(p.Id);
                    }

                    yield return new AIStreamChunk("products", productsJson);
                }
                else if (toolCall.FunctionName == "generate_design_image")
                {
                    var args = JsonSerializer.Deserialize<JsonElement>(toolCall.FunctionArguments.ToString());
                    var description = args.GetProperty("description").GetString()!;
                    var imageUrl = await GenerateDesignImageAsync(description);

                    conversation.GeneratedImageUrls.Add(imageUrl);

                    messages.Add(new AssistantChatMessage(new[] { ChatToolCall.CreateFunctionToolCall(toolCall.Id, toolCall.FunctionName, toolCall.FunctionArguments) }));
                    messages.Add(new ToolChatMessage(toolCall.Id, $"Image generated: {imageUrl}"));

                    yield return new AIStreamChunk("image", imageUrl);
                }
            }

            var followUp = _chatClient.CompleteChatAsync(messages, options).GetAwaiter().GetResult();
            var assistantText = followUp.Value.Content[0].Text;
            history.Add(new ChatMessageRecord("assistant", assistantText));
            yield return new AIStreamChunk("text", assistantText);
        }
        else
        {
            var assistantText = response.Value.Content[0].Text;
            history.Add(new ChatMessageRecord("assistant", assistantText));
            yield return new AIStreamChunk("text", assistantText);
        }

        conversation.MessagesJson = JsonSerializer.Serialize(history);
        await _context.SaveChangesAsync();
    }

    public async Task<string> GenerateDesignImageAsync(string description)
    {
        var imagePrompt = $"Luxury jewellery product photography, white background, studio lighting: {description}";

        var result = await _imageClient.GenerateImageAsync(imagePrompt, new ImageGenerationOptions
        {
            Quality = GeneratedImageQuality.High,
            Size = GeneratedImageSize.W1024xH1024,
            ResponseFormat = GeneratedImageFormat.Bytes
        });

        var fileName = $"ai-designs/{Guid.NewGuid()}.png";
        var url = await _blobStorage.UploadAsync("images", fileName, result.Value.ImageBytes.ToArray(), "image/png");
        return url;
    }

    private async Task<List<Domain.Entities.Product>> SearchInventoryAsync(JsonElement filters)
    {
        var query = _context.Products.Where(p => p.IsActive).AsQueryable();

        if (filters.TryGetProperty("jewelleryType", out var jt) && Enum.TryParse<JewelleryType>(jt.GetString(), out var jewelleryType))
            query = query.Where(p => p.JewelleryType == jewelleryType);

        if (filters.TryGetProperty("metalType", out var mt) && Enum.TryParse<MetalType>(mt.GetString(), out var metalType))
            query = query.Where(p => p.MetalType == metalType);

        if (filters.TryGetProperty("stoneType", out var st) && Enum.TryParse<StoneType>(st.GetString(), out var stoneType))
            query = query.Where(p => p.StoneType == stoneType);

        if (filters.TryGetProperty("minPrice", out var minP))
            query = query.Where(p => p.SellingPrice >= minP.GetDecimal());

        if (filters.TryGetProperty("maxPrice", out var maxP))
            query = query.Where(p => p.SellingPrice <= maxP.GetDecimal());

        return await query.Take(6).ToListAsync();
    }
}

internal record ChatMessageRecord(string Role, string Content);
