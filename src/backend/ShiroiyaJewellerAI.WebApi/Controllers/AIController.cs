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
}

public record AIChatRequest(string Message, Guid? ConversationId);
public record GenerateImageRequest(string Description);
