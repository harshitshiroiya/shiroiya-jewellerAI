using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ApplicationDbContext _context;

    public AIController(IAIService aiService, ApplicationDbContext context)
    {
        _aiService = aiService;
        _context = context;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpPost("chat")]
    public async Task Chat([FromBody] AIChatRequest request)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        var conversationId = request.ConversationId ?? Guid.NewGuid();

        await foreach (var chunk in _aiService.ChatStreamAsync(UserId, conversationId, request.Message))
        {
            var data = JsonSerializer.Serialize(new { type = chunk.Type, content = chunk.Content, conversationId });
            await Response.WriteAsync($"data: {data}\n\n");
            await Response.Body.FlushAsync();
        }

        await Response.WriteAsync("data: [DONE]\n\n");
        await Response.Body.FlushAsync();
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var conversations = await _context.AIConversations
            .Where(c => c.UserId == UserId)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new { c.Id, c.CreatedAt, c.UpdatedAt })
            .ToListAsync();
        return Ok(conversations);
    }

    [HttpGet("conversations/{id:guid}")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        var conversation = await _context.AIConversations
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    [HttpPost("generate-image")]
    public async Task<IActionResult> GenerateImage([FromBody] GenerateImageRequest request)
    {
        var imageUrl = await _aiService.GenerateDesignImageAsync(request.Description);
        return Ok(new { imageUrl });
    }

    [AllowAnonymous]
    [HttpPost("try-on")]
    public async Task<IActionResult> TryOn([FromBody] TryOnRequest request)
    {
        try
        {
            // Strip data URL prefix from user photo
            var userPhotoBase64 = StripDataUrlPrefix(request.UserPhoto);
            var jewelleryPhotoBase64 = StripDataUrlPrefix(request.JewelleryPhoto);

            var result = await _aiService.TryOnAsync(userPhotoBase64, jewelleryPhotoBase64, request.JewelleryType);

            if (string.IsNullOrEmpty(result))
                return Ok(new { error = "Failed to generate try-on image. The AI service may be unavailable or quota exceeded." });

            return Ok(new { imageUrl = result });
        }
        catch (Exception ex)
        {
            return Ok(new { error = $"An error occurred while processing the try-on request: {ex.Message}" });
        }
    }

    [AllowAnonymous]
    [HttpPost("design/generate")]
    public async Task<IActionResult> GenerateDesign([FromBody] DesignGenerateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest(new { error = "Prompt is required." });

        var result = await _aiService.GenerateDesignAsync(request.Prompt, request.Style, request.ReferenceImageBase64);
        return Ok(new { images = result.Images.Select(i => new { imageUrl = i.ImageUrl, id = i.Id }), prompt = request.Prompt });
    }

    [AllowAnonymous]
    [HttpPost("design/refine")]
    public async Task<IActionResult> RefineDesign([FromBody] DesignRefineRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BaseImageBase64))
            return BadRequest(new { error = "Base image is required." });
        if (string.IsNullOrWhiteSpace(request.Modification))
            return BadRequest(new { error = "Modification instructions are required." });

        var result = await _aiService.RefineDesignAsync(request.BaseImageBase64, request.Modification);
        return Ok(new { images = result.Images.Select(i => new { imageUrl = i.ImageUrl, id = i.Id }) });
    }

    [AllowAnonymous]
    [HttpPost("design/edit-region")]
    public async Task<IActionResult> EditDesignRegion([FromBody] DesignEditRegionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ImageBase64))
            return BadRequest(new { error = "Image is required." });
        if (string.IsNullOrWhiteSpace(request.MaskBase64))
            return BadRequest(new { error = "Mask is required." });
        if (string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest(new { error = "Prompt is required." });

        var result = await _aiService.EditDesignRegionAsync(request.ImageBase64, request.MaskBase64, request.Prompt);
        return Ok(new { images = result.Images.Select(i => new { imageUrl = i.ImageUrl, id = i.Id }) });
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
}

public record AIChatRequest(string Message, Guid? ConversationId);
public record GenerateImageRequest(string Description);
public record TryOnRequest(string UserPhoto, string JewelleryPhoto, string JewelleryType);
public record DesignGenerateRequest(string Prompt, string? Style, string? ReferenceImageBase64);
public record DesignRefineRequest(string BaseImageBase64, string Modification);
public record DesignEditRegionRequest(string ImageBase64, string MaskBase64, string Prompt);
