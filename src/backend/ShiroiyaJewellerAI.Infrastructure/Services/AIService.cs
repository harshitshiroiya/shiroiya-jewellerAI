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
    private readonly IMetalPriceService _metalPriceService;
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

    public AIService(IConfiguration configuration, ApplicationDbContext context, ILogger<AIService> logger, IMetalPriceService metalPriceService)
    {
        _context = context;
        _logger = logger;
        _metalPriceService = metalPriceService;

        var geminiKey = configuration["Gemini:ApiKey"];
        var openAiKey = configuration["OpenAI:ApiKey"];
        var azureEndpoint = configuration["AzureOpenAI:Endpoint"];
        var azureKey = configuration["AzureOpenAI:ApiKey"];

        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            _geminiApiKey = geminiKey;
            var model = configuration["Gemini:Model"] ?? "gemini-2.5-flash";
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
                    var rates = await _metalPriceService.GetTodaysRatesAsync();
                    var productsJson = SerializeProducts(products, rates);

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

        var typeKeywords = new (string Key, JewelleryType Value)[]
        {
            ("earring", JewelleryType.Earring), ("necklace", JewelleryType.Necklace),
            ("bracelet", JewelleryType.Bracelet), ("pendant", JewelleryType.Pendant),
            ("bangle", JewelleryType.Bangle), ("ring", JewelleryType.Ring)
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
        decimal? maxBudget = null;

        foreach (var (key, value) in typeKeywords)
            if (lower.Contains(key)) { matchedType = value; break; }
        foreach (var kv in metalKeywords)
            if (lower.Contains(kv.Key)) { matchedMetal = kv.Value; break; }
        foreach (var kv in stoneKeywords)
            if (lower.Contains(kv.Key)) { matchedStone = kv.Value; break; }

        var budgetMatch = System.Text.RegularExpressions.Regex.Match(lower, @"(\d[\d,]*)\s*(inr|₹|rupee|lakh|k\b)");
        if (budgetMatch.Success)
        {
            var numStr = budgetMatch.Groups[1].Value.Replace(",", "");
            if (decimal.TryParse(numStr, out var budget))
            {
                if (lower.Contains("lakh")) budget *= 100000;
                else if (budgetMatch.Groups[2].Value == "k") budget *= 1000;
                maxBudget = budget;
            }
        }

        if (matchedType == null && matchedMetal == null && matchedStone == null && maxBudget == null)
        {
            var reply = "Welcome to Shiroiya! I'm your personal jewellery concierge. " +
                  "Tell me what you're looking for and I'll find the perfect piece:\n\n" +
                  "- **Type**: ring, necklace, earrings, bracelet, pendant, bangle\n" +
                  "- **Occasion**: engagement, anniversary, birthday, daily wear\n" +
                  "- **Metal & Stone**: gold, platinum, diamond, ruby, etc.\n" +
                  "- **Budget**: your range in ₹\n\n" +
                  "Or simply describe the piece you're imagining!";
            history.Add(new ChatMessageRecord("assistant", reply));
            yield return new AIStreamChunk("text", reply);
            yield break;
        }

        var rates = await _metalPriceService.GetTodaysRatesAsync();

        var query = _context.Products.Where(p => p.IsActive).AsQueryable();
        if (matchedType != null) query = query.Where(p => p.JewelleryType == matchedType.Value);
        if (matchedMetal != null) query = query.Where(p => p.MetalType == matchedMetal.Value);
        if (matchedStone != null) query = query.Where(p => p.StoneType == matchedStone.Value);

        var allMatches = await query.ToListAsync();
        var withPrices = allMatches.Select(p => (Product: p, LivePrice: GetLivePrice(p, rates))).ToList();

        if (maxBudget != null)
            withPrices = withPrices.Where(x => x.LivePrice <= maxBudget.Value).ToList();

        var budgetRelaxed = false;
        if (withPrices.Count == 0 && maxBudget != null)
        {
            budgetRelaxed = true;
            withPrices = allMatches.Select(p => (Product: p, LivePrice: GetLivePrice(p, rates))).ToList();
        }

        var products = withPrices.OrderBy(x => x.LivePrice).Take(6).Select(x => x.Product).ToList();

        if (products.Count > 0)
        {
            var productsJson = SerializeProducts(products, rates);
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

            var lowestPrice = products.Min(p => GetLivePrice(p, rates));
            var budgetNote = maxBudget != null
                ? (budgetRelaxed
                    ? $"Nothing was available under ₹{maxBudget:N0}, but here are the closest options starting from ₹{lowestPrice:N0}. "
                    : $"Showing options within your ₹{maxBudget:N0} budget. ")
                : "";

            var reply = $"I found {products.Count} exquisite {desc} piece(s) from our collection. " +
                        "Each is handcrafted by our master artisans with certified materials. Prices are based on today's live metal rates. " +
                        budgetNote +
                        "Would you like details on any piece, or shall I refine the search?";
            history.Add(new ChatMessageRecord("assistant", reply));
            yield return new AIStreamChunk("text", reply);
        }
        else
        {
            var typeName = matchedType?.ToString().ToLower() ?? "jewellery";
            var reply = $"We don't have an exact match for your {typeName} preferences in stock right now, but our artisans can craft a bespoke piece tailored to your specifications. " +
                        "I've noted your preferences:\n\n" +
                        (matchedMetal != null ? $"- **Metal**: {matchedMetal}\n" : "") +
                        (matchedStone != null ? $"- **Stone**: {matchedStone}\n" : "") +
                        (maxBudget != null ? $"- **Budget**: ₹{maxBudget:N0}\n" : "") +
                        "\nWould you like me to show similar pieces from our collection, or shall I connect you with our design team for a custom creation?";
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

    public async Task<string> TryOnAsync(string userPhotoBase64, string jewelleryPhotoBase64, string jewelleryType)
    {
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
            return "";

        try
        {
            var prompt = $"Realistically place this {jewelleryType} on the person in the photo. Make it look natural, as if they are wearing it. Maintain the original photo quality and lighting.";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = prompt },
                            new { inline_data = new { mime_type = "image/png", data = userPhotoBase64 } },
                            new { inline_data = new { mime_type = "image/png", data = jewelleryPhotoBase64 } }
                        }
                    }
                },
                generationConfig = new
                {
                    responseModalities = new[] { "TEXT", "IMAGE" }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={_geminiApiKey}";
            var response = await Http.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini Try-On API returned {Status}: {Body}", response.StatusCode, errorBody);
                return "";
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            if (json.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var content = candidates[0].GetProperty("content");
                if (content.TryGetProperty("parts", out var parts))
                {
                    foreach (var part in parts.EnumerateArray())
                    {
                        if (part.TryGetProperty("inlineData", out var inlineData) ||
                            part.TryGetProperty("inline_data", out inlineData))
                        {
                            var base64Data = inlineData.GetProperty("data").GetString();
                            var mimeType = inlineData.GetProperty("mimeType").GetString()
                                           ?? inlineData.GetProperty("mime_type").GetString()
                                           ?? "image/png";
                            return $"data:{mimeType};base64,{base64Data}";
                        }
                    }
                }
            }

            _logger.LogWarning("Gemini Try-On response did not contain an image");
            return "";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Try-On image generation failed");
            return "";
        }
    }

    public async Task<DesignGenerationResult> GenerateDesignAsync(string prompt, string? style, string? referenceImageBase64)
    {
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
            return new DesignGenerationResult(new List<GeneratedImage>());

        try
        {
            var styleText = string.IsNullOrWhiteSpace(style) ? "luxury modern" : style;
            var engineeredPrompt = $"Professional jewelry product photography, photorealistic, studio lighting, white background, high-end catalogue shot, detailed metalwork and gemstones: {prompt}. Style: {styleText}";

            var parts = new List<object> { new { text = engineeredPrompt } };

            if (!string.IsNullOrWhiteSpace(referenceImageBase64))
            {
                var refBase64 = StripDataUrlPrefix(referenceImageBase64);
                parts.Add(new { inline_data = new { mime_type = "image/png", data = refBase64 } });
            }

            var requestBody = new
            {
                contents = new[] { new { parts } },
                generationConfig = new { responseModalities = new[] { "TEXT", "IMAGE" } }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={_geminiApiKey}";
            var response = await Http.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini Design Generate API returned {Status}: {Body}", response.StatusCode, errorBody);
                return new DesignGenerationResult(new List<GeneratedImage>());
            }

            var imageUrl = await ExtractImageFromGeminiResponse(response);
            if (!string.IsNullOrEmpty(imageUrl))
            {
                return new DesignGenerationResult(new List<GeneratedImage>
                {
                    new GeneratedImage(Guid.NewGuid().ToString(), imageUrl)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Design generation failed");
        }

        return new DesignGenerationResult(new List<GeneratedImage>());
    }

    public async Task<DesignGenerationResult> RefineDesignAsync(string baseImageBase64, string modification)
    {
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
            return new DesignGenerationResult(new List<GeneratedImage>());

        try
        {
            var base64 = StripDataUrlPrefix(baseImageBase64);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = modification },
                            new { inline_data = new { mime_type = "image/png", data = base64 } }
                        }
                    }
                },
                generationConfig = new { responseModalities = new[] { "TEXT", "IMAGE" } }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={_geminiApiKey}";
            var response = await Http.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini Refine API returned {Status}: {Body}", response.StatusCode, errorBody);
                return new DesignGenerationResult(new List<GeneratedImage>());
            }

            var imageUrl = await ExtractImageFromGeminiResponse(response);
            if (!string.IsNullOrEmpty(imageUrl))
            {
                return new DesignGenerationResult(new List<GeneratedImage>
                {
                    new GeneratedImage(Guid.NewGuid().ToString(), imageUrl)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Design refinement failed");
        }

        return new DesignGenerationResult(new List<GeneratedImage>());
    }

    public async Task<DesignGenerationResult> EditDesignRegionAsync(string imageBase64, string maskBase64, string prompt)
    {
        if (string.IsNullOrWhiteSpace(_geminiApiKey))
            return new DesignGenerationResult(new List<GeneratedImage>());

        try
        {
            var imgBase64 = StripDataUrlPrefix(imageBase64);
            var mskBase64 = StripDataUrlPrefix(maskBase64);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = $"Edit the circled/highlighted region: {prompt}" },
                            new { inline_data = new { mime_type = "image/png", data = imgBase64 } },
                            new { inline_data = new { mime_type = "image/png", data = mskBase64 } }
                        }
                    }
                },
                generationConfig = new { responseModalities = new[] { "TEXT", "IMAGE" } }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={_geminiApiKey}";
            var response = await Http.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini Edit Region API returned {Status}: {Body}", response.StatusCode, errorBody);
                return new DesignGenerationResult(new List<GeneratedImage>());
            }

            var imageUrl = await ExtractImageFromGeminiResponse(response);
            if (!string.IsNullOrEmpty(imageUrl))
            {
                return new DesignGenerationResult(new List<GeneratedImage>
                {
                    new GeneratedImage(Guid.NewGuid().ToString(), imageUrl)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Design region edit failed");
        }

        return new DesignGenerationResult(new List<GeneratedImage>());
    }

    private async Task<string> ExtractImageFromGeminiResponse(HttpResponseMessage response)
    {
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (json.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var content = candidates[0].GetProperty("content");
            if (content.TryGetProperty("parts", out var parts))
            {
                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("inlineData", out var inlineData) ||
                        part.TryGetProperty("inline_data", out inlineData))
                    {
                        var base64Data = inlineData.GetProperty("data").GetString();
                        string? mimeType = null;
                        if (inlineData.TryGetProperty("mimeType", out var mt))
                            mimeType = mt.GetString();
                        else if (inlineData.TryGetProperty("mime_type", out var mt2))
                            mimeType = mt2.GetString();
                        mimeType ??= "image/png";
                        return $"data:{mimeType};base64,{base64Data}";
                    }
                }
            }
        }

        _logger.LogWarning("Gemini response did not contain an image");
        return "";
    }

    private static string StripDataUrlPrefix(string dataUrl)
    {
        if (string.IsNullOrWhiteSpace(dataUrl))
            return dataUrl;

        var commaIndex = dataUrl.IndexOf(',');
        if (commaIndex >= 0 && dataUrl.StartsWith("data:"))
            return dataUrl[(commaIndex + 1)..];

        return dataUrl;
    }

    private decimal GetLivePrice(Domain.Entities.Product p, MetalRates rates) =>
        _metalPriceService.CalculateSellingPrice(p.WeightInGrams, p.Purity, p.MetalType.ToString(), p.MakingChargePercent, p.WastagePercent, p.StonePrice, rates);

    private static readonly JsonSerializerOptions CamelCase = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private string SerializeProducts(List<Domain.Entities.Product> products, MetalRates rates) =>
        JsonSerializer.Serialize(products.Select(p => new { p.Id, p.Name, p.Description, SellingPrice = GetLivePrice(p, rates), MetalType = p.MetalType.ToString(), StoneType = p.StoneType.ToString(), p.Purity, p.WeightInGrams, p.ImageUrls }), CamelCase);

    private async Task<List<Domain.Entities.Product>> SearchInventoryAsync(JsonElement filters)
    {
        var query = _context.Products.Where(p => p.IsActive).AsQueryable();

        if (filters.TryGetProperty("jewelleryType", out var jt) && Enum.TryParse<JewelleryType>(jt.GetString(), out var jewelleryType))
            query = query.Where(p => p.JewelleryType == jewelleryType);

        if (filters.TryGetProperty("metalType", out var mt) && Enum.TryParse<MetalType>(mt.GetString(), out var metalType))
            query = query.Where(p => p.MetalType == metalType);

        if (filters.TryGetProperty("stoneType", out var st) && Enum.TryParse<StoneType>(st.GetString(), out var stoneType))
            query = query.Where(p => p.StoneType == stoneType);

        return await query.Take(6).ToListAsync();
    }
}

internal record ChatMessageRecord(string Role, string Content);
