using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/custom-designs")]
[Authorize]
public class CustomDesignsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomDesignsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetMyDesigns()
    {
        var designs = await _context.CustomDesigns
            .Where(d => d.UserId == UserId)
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync();
        return Ok(designs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDesign(Guid id)
    {
        var design = await _context.CustomDesigns.FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);
        if (design == null) return NotFound();
        return Ok(design);
    }

    [HttpPost]
    public async Task<IActionResult> SaveDesign([FromBody] SaveDesignRequest request)
    {
        var design = new CustomDesign
        {
            UserId = UserId,
            BaseType = request.BaseType,
            MetalType = request.MetalType,
            Purity = request.Purity,
            StoneType = request.StoneType,
            StoneShape = request.StoneShape,
            StoneColor = request.StoneColor,
            StoneClarity = request.StoneClarity,
            StoneCarat = request.StoneCarat,
            ConfigurationJson = request.ConfigurationJson,
            PreviewImageUrl = request.PreviewImageUrl,
            EstimatedPrice = CalculateEstimatedPrice(request),
            Status = CustomDesignStatus.Draft
        };

        _context.CustomDesigns.Add(design);
        await _context.SaveChangesAsync();
        return Ok(design);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDesign(Guid id, [FromBody] SaveDesignRequest request)
    {
        var design = await _context.CustomDesigns.FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);
        if (design == null) return NotFound();

        design.BaseType = request.BaseType;
        design.MetalType = request.MetalType;
        design.Purity = request.Purity;
        design.StoneType = request.StoneType;
        design.StoneShape = request.StoneShape;
        design.StoneColor = request.StoneColor;
        design.StoneClarity = request.StoneClarity;
        design.StoneCarat = request.StoneCarat;
        design.ConfigurationJson = request.ConfigurationJson;
        design.PreviewImageUrl = request.PreviewImageUrl;
        design.EstimatedPrice = CalculateEstimatedPrice(request);

        await _context.SaveChangesAsync();
        return Ok(design);
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> SubmitDesign(Guid id)
    {
        var design = await _context.CustomDesigns.FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);
        if (design == null) return NotFound();

        design.Status = CustomDesignStatus.AddedToCart;
        await _context.SaveChangesAsync();
        return Ok(design);
    }

    [HttpPost("calculate-price")]
    [AllowAnonymous]
    public IActionResult GetCalculatedPrice([FromBody] SaveDesignRequest request)
    {
        var price = CalculateEstimatedPrice(request);
        return Ok(new { estimatedPrice = price });
    }

    private static decimal CalculateEstimatedPrice(SaveDesignRequest request)
    {
        decimal basePrice = request.BaseType switch
        {
            JewelleryType.Ring => 15000,
            JewelleryType.Earring => 20000,
            JewelleryType.Necklace => 50000,
            JewelleryType.Bracelet => 30000,
            JewelleryType.Pendant => 12000,
            JewelleryType.Bangle => 35000,
            _ => 10000
        };

        decimal metalMultiplier = request.MetalType switch
        {
            MetalType.Gold => 2.5m,
            MetalType.Platinum => 3.5m,
            MetalType.WhiteGold => 2.8m,
            MetalType.RoseGold => 2.6m,
            MetalType.Silver => 1.0m,
            _ => 1.0m
        };

        decimal stonePrice = request.StoneType switch
        {
            StoneType.Diamond => (request.StoneCarat ?? 0.5m) * 80000,
            StoneType.Ruby => (request.StoneCarat ?? 0.5m) * 50000,
            StoneType.Emerald => (request.StoneCarat ?? 0.5m) * 45000,
            StoneType.Sapphire => (request.StoneCarat ?? 0.5m) * 40000,
            StoneType.Pearl => 5000,
            _ => 0
        };

        return Math.Round(basePrice * metalMultiplier + stonePrice, 2);
    }
}

public record SaveDesignRequest(
    JewelleryType BaseType,
    MetalType MetalType,
    string Purity,
    StoneType StoneType,
    StoneShape? StoneShape,
    string? StoneColor,
    string? StoneClarity,
    decimal? StoneCarat,
    string ConfigurationJson,
    string? PreviewImageUrl);
