using System.ClientModel;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly ApplicationDbContext _context;
    private readonly ChatClient? _chatClient;
    private readonly ILogger<AIService> _logger;
    private readonly bool _aiEnabled;
    private readonly string? _geminiApiKey;
    private static readonly HttpClient Http = new();

    private static readonly ChatTool SearchInventoryTool = ChatTool.CreateFunctionTool(
        "search_inventory",
        "Search jewellery inventory by filters. Use this when the customer asks about products, collections, or wants recommendations.",
        BinaryData.FromString("""
        {
            "type": "object",
            "properties": {
                "jewelleryType": { "type": "string", "enum": ["Ring", "Earring", "Necklace", "Bracelet", "Pendant", "Bangle"] },
                "metalType": { "type": "string", "enum": ["Gold", "Silver", "Platinum", "RoseGold", "WhiteGold"] },
                "stoneType": { "type": "string", "enum": ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "None"] },
                "minPrice": { "type": "number" },
                "maxPrice": { "type": "number" }
            }
        }
        """));

    private static readonly ChatTool GenerateDesignTool = ChatTool.CreateFunctionTool(
        "generate_design_image",
        "Generate a custom jewellery design image when the customer wants to visualize a bespoke piece.",
        BinaryData.FromString("""
        {
            "type": "object",
            "properties": {
                "description": { "type": "string", "description": "Detailed visual description of the jewellery piece for image generation" }
            },
            "required": ["description"]
        }
        """));

    private const string SystemPrompt = """
        You are a luxury jewellery consultant for Shiroiya Jewellers — an exclusive Indian jewellery house.

        STRICT RULES:
        1. You ONLY discuss jewellery, gemstones, metals, jewellery care, gifting advice, and topics directly related to the jewellery industry.
        2. If the user asks ANYTHING unrelated to jewellery (politics, coding, weather, general chat, etc.), politely decline:
           "I appreciate your curiosity, but I'm exclusively trained as your jewellery concierge. I'd love to help you discover the perfect piece — what occasion are you shopping for?"
        3. Never break character. You are always the Shiroiya concierge.

        BEHAVIOUR:
        - When a customer describes what they want (occasion, style, budget, recipient), use search_inventory to find matches.
        - If nothing matches or they want something unique, use generate_design_image to create a concept visualization.
        - Ask clarifying questions: budget range, metal preference, gemstone preference, occasion, recipient.
        - Be warm, knowledgeable, and concise. Mention Indian jewellery heritage where relevant.
        - Use ₹ (INR) for all prices. Speak about karats, cuts, clarity when discussing gems/metals.
        - Keep responses under 150 words unless showing product details.
        """;

    public AIService(IConfiguration configuration, ApplicationDbContext context, ILogger<AIService> logger)
    {
        _context = context;
        _logger = logger;

        var geminiKey = configuration["Gemini:ApiKey"];
        var openAiKey = configuration["OpenAI:ApiKey"];
        var azureEndpoint = configuration["AzureOpenAI:Endpoint"];
        var azureKey = configuration["AzureOpenAI:ApiKey"];

        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            _geminiApiKey = geminiKey;
            var model = configuration["Gemini:Model"] ?? "gemini-2.0-flash";
            var options = new OpenAIClientOptions
            {
                Endpoint = new Uri("https://generativelanguage.googleapis.com/v1beta/openai/")
            };
            var client = new OpenAIClient(new ApiKeyCredential(geminiKey), options);
            _chatClient = client.GetChatClient(model);
            _aiEnabled = true;
            _logger.LogInformation("AI Service using Google Gemini (model: {Model})", model);
        }
        else if (!string.IsNullOrWhiteSpace(openAiKey))
        {
            var model = configuration["OpenAI:Model"] ?? "gpt-4o";
            var client = new OpenAIClient(openAiKey);
            _chatClient = client.GetChatClient(model);
            _aiEnabled = true;
            _logger.LogInformation("AI Service using OpenAI API (model: {Model})", model);
        }
        else if (!string.IsNullOrWhiteSpace(azureEndpoint) && !string.IsNullOrWhiteSpace(azureKey))
        {
            var chatDeployment = configuration["AzureOpenAI:ChatDeployment"] ?? "gpt-4o";
            var azureClient = new Azure.AI.OpenAI.AzureOpenAIClient(new Uri(azureEndpoint), new Azure.AzureKeyCredential(azureKey));
            _chatClient = azureClient.GetChatClient(chatDeployment);
            _aiEnabled = true;
            _logger.LogInformation("AI Service using Azure OpenAI (deployment: {Deployment})", chatDeployment);
        }
        else
        {
            _aiEnabled = false;
            _logger.LogWarning("No AI provider configured. Using keyword fallback. Set Gemini:ApiKey, OpenAI:ApiKey, or AzureOpenAI config.");
        }
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

        if (!_aiEnabled)
        {
            await foreach (var chunk in FallbackChatAsync(userMessage, history, conversation))
                yield return chunk;
        }
        else
        {
            var chunks = new List<AIStreamChunk>();
            var usedFallback = false;
            try
            {
                await foreach (var chunk in AiChatAsync(userMessage, history, conversation))
                    chunks.Add(chunk);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI provider failed, falling back to keyword search");
                usedFallback = true;
            }

            if (usedFallback)
            {
                await foreach (var chunk in FallbackChatAsync(userMessage, history, conversation))
                    yield return chunk;
            }
            else
            {
                foreach (var chunk in chunks)
                    yield return chunk;
            }
        }

        conversation.MessagesJson = JsonSerializer.Serialize(history);
        await _context.SaveChangesAsync();
    }

    private async IAsyncEnumerable<AIStreamChunk> AiChatAsync(string userMessage, List<ChatMessageRecord> history, Domain.Entities.AIConversation conversation)
    {
        var messages = new List<ChatMessage> { new SystemChatMessage(SystemPrompt) };
        foreach (var msg in history.TakeLast(20))
        {
            if (msg.Role == "user") messages.Add(new UserChatMessage(msg.Content));
            else if (msg.Role == "assistant") messages.Add(new AssistantChatMessage(msg.Content));
        }

        var options = new ChatCompletionOptions();
        options.Tools.Add(SearchInventoryTool);
        options.Tools.Add(GenerateDesignTool);

        var response = await _chatClient!.CompleteChatAsync(messages, options);

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

                    if (!string.IsNullOrEmpty(imageUrl))
                    {
                        conversation.GeneratedImageUrls.Add(imageUrl);
                        messages.Add(new AssistantChatMessage(new[] { ChatToolCall.CreateFunctionToolCall(toolCall.Id, toolCall.FunctionName, toolCall.FunctionArguments) }));
                        messages.Add(new ToolChatMessage(toolCall.Id, $"Image generated successfully: {imageUrl}"));
                        yield return new AIStreamChunk("image", imageUrl);
                    }
                    else
                    {
                        messages.Add(new AssistantChatMessage(new[] { ChatToolCall.CreateFunctionToolCall(toolCall.Id, toolCall.FunctionName, toolCall.FunctionArguments) }));
                        messages.Add(new ToolChatMessage(toolCall.Id, "Image generation is not available right now."));
                    }
                }
            }

            var followUp = await _chatClient.CompleteChatAsync(messages, options);
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
    }

    private async IAsyncEnumerable<AIStreamChunk> FallbackChatAsync(string userMessage, List<ChatMessageRecord> history, Domain.Entities.AIConversation conversation)
    {
        var lower = userMessage.ToLowerInvariant();
        var query = _context.Products.Where(p => p.IsActive).AsQueryable();

        var typeKeywords = new Dictionary<string, JewelleryType>
        {
            ["ring"] = JewelleryType.Ring, ["earring"] = JewelleryType.Earring,
            ["necklace"] = JewelleryType.Necklace, ["bracelet"] = JewelleryType.Bracelet,
            ["pendant"] = JewelleryType.Pendant, ["bangle"] = JewelleryType.Bangle
        };
        var metalKeywords = new Dictionary<string, MetalType>
        {
            ["gold"] = MetalType.Gold, ["silver"] = MetalType.Silver,
            ["platinum"] = MetalType.Platinum, ["rose gold"] = MetalType.RoseGold
        };
        var stoneKeywords = new Dictionary<string, StoneType>
        {
            ["diamond"] = StoneType.Diamond, ["ruby"] = StoneType.Ruby,
            ["emerald"] = StoneType.Emerald, ["sapphire"] = StoneType.Sapphire, ["pearl"] = StoneType.Pearl
        };

        JewelleryType? matchedType = null;
        MetalType? matchedMetal = null;
        StoneType? matchedStone = null;

        foreach (var kv in typeKeywords)
            if (lower.Contains(kv.Key)) { matchedType = kv.Value; query = query.Where(p => p.JewelleryType == kv.Value); break; }
        foreach (var kv in metalKeywords)
            if (lower.Contains(kv.Key)) { matchedMetal = kv.Value; query = query.Where(p => p.MetalType == kv.Value); break; }
        foreach (var kv in stoneKeywords)
            if (lower.Contains(kv.Key)) { matchedStone = kv.Value; query = query.Where(p => p.StoneType == kv.Value); break; }

        var products = await query.Take(6).ToListAsync();

        if (products.Count > 0)
        {
            var productsJson = JsonSerializer.Serialize(products.Select(p => new { p.Id, p.Name, p.SellingPrice, p.MetalType, p.StoneType, p.ImageUrls }));
            foreach (var p in products)
            {
                if (!conversation.RecommendedProductIds.Contains(p.Id))
                    conversation.RecommendedProductIds.Add(p.Id);
            }
            yield return new AIStreamChunk("products", productsJson);

            var typeName = matchedType?.ToString() ?? "jewellery";
            var metalName = matchedMetal?.ToString() ?? "";
            var stoneName = matchedStone?.ToString() ?? "";
            var desc = $"{metalName} {stoneName} {typeName}".Trim();

            var reply = $"I found {products.Count} exquisite {desc} piece(s) from our collection. " +
                        "Each is handcrafted by our master artisans. " +
                        "Would you like details on any of these, or shall I refine the search by budget or occasion?";
            history.Add(new ChatMessageRecord("assistant", reply));
            yield return new AIStreamChunk("text", reply);
        }
        else
        {
            var reply = (matchedType != null || matchedMetal != null || matchedStone != null)
                ? "Our current collection doesn't have an exact match, but our artisans can craft a bespoke piece for you. " +
                  "Could you share more details?\n\n" +
                  "- What occasion is this for?\n" +
                  "- Preferred metal (gold, silver, platinum, rose gold)?\n" +
                  "- Stone preference (diamond, ruby, emerald, sapphire, pearl)?\n" +
                  "- Approximate budget range in ₹?"
                : "Welcome to Shiroiya! I'm your personal jewellery concierge. " +
                  "Tell me what you're looking for and I'll find the perfect piece:\n\n" +
                  "- **Type**: ring, necklace, earrings, bracelet, pendant, bangle\n" +
                  "- **Occasion**: engagement, anniversary, birthday, daily wear\n" +
                  "- **Metal & Stone**: gold, platinum, diamond, ruby, etc.\n" +
                  "- **Budget**: your range in ₹\n\n" +
                  "Or simply describe the piece you're imagining!";

            history.Add(new ChatMessageRecord("assistant", reply));
            yield return new AIStreamChunk("text", reply);
        }
    }

    public async Task<string> GenerateDesignImageAsync(string description)
    {
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
            return "";

        try
        {
            var prompt = $"Luxury jewellery product photography, white marble background, studio lighting, high-end catalogue shot: {description}";
            var requestBody = new
            {
                instances = new[] { new { prompt } },
                parameters = new { sampleCount = 1 }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={_geminiApiKey}";
            var response = await Http.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Imagen API returned {Status}", response.StatusCode);
                return "";
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            if (json.TryGetProperty("predictions", out var predictions) && predictions.GetArrayLength() > 0)
            {
                var base64 = predictions[0].GetProperty("bytesBase64Encoded").GetString();
                return $"data:image/png;base64,{base64}";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Image generation failed");
        }

        return "";
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
