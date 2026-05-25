using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMetalPriceService _metalPriceService;

    public ProductsController(ApplicationDbContext context, IMetalPriceService metalPriceService)
    {
        _context = context;
        _metalPriceService = metalPriceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] MetalType? metal,
        [FromQuery] StoneType? stone,
        [FromQuery] JewelleryType? type,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string sort = "name_asc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var rates = await _metalPriceService.GetTodaysRatesAsync();

        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category.Slug == category);
        if (metal.HasValue)
            query = query.Where(p => p.MetalType == metal.Value);
        if (stone.HasValue)
            query = query.Where(p => p.StoneType == stone.Value);
        if (type.HasValue)
            query = query.Where(p => p.JewelleryType == type.Value);

        var totalCount = await query.CountAsync();
        var products = await query.ToListAsync();

        var projected = products.Select(p => ToDto(p, rates)).ToList();

        if (minPrice.HasValue)
            projected = projected.Where(p => p.SellingPrice >= minPrice.Value).ToList();
        if (maxPrice.HasValue)
            projected = projected.Where(p => p.SellingPrice <= maxPrice.Value).ToList();

        projected = sort switch
        {
            "price_asc" => projected.OrderBy(p => p.SellingPrice).ToList(),
            "price_desc" => projected.OrderByDescending(p => p.SellingPrice).ToList(),
            "name_desc" => projected.OrderByDescending(p => p.Name).ToList(),
            "newest" => projected.OrderByDescending(p => p.CreatedAt).ToList(),
            _ => projected.OrderBy(p => p.Name).ToList()
        };

        var paged = projected.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Ok(new { items = paged, totalCount = projected.Count, page, pageSize, metalRates = new { rates.GoldPerGram, rates.SilverPerGram, rates.FetchedAt } });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound();

        var rates = await _metalPriceService.GetTodaysRatesAsync();
        return Ok(ToDto(product, rates));
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var rates = await _metalPriceService.GetTodaysRatesAsync();
        var products = await _context.Products
            .Where(p => p.IsFeatured && p.IsActive)
            .Take(12)
            .ToListAsync();
        return Ok(products.Select(p => ToDto(p, rates)));
    }

    [HttpGet("rates")]
    public async Task<IActionResult> GetMetalRates()
    {
        var rates = await _metalPriceService.GetTodaysRatesAsync();
        return Ok(new
        {
            rates.GoldPerGram,
            rates.SilverPerGram,
            rates.FetchedAt,
            gold22K = Math.Round(rates.GoldPerGram * (22m / 24m), 2),
            gold18K = Math.Round(rates.GoldPerGram * (18m / 24m), 2),
            silver925 = Math.Round(rates.SilverPerGram * 0.925m, 2)
        });
    }

    private ProductDto ToDto(Product p, MetalRates rates)
    {
        var livePrice = _metalPriceService.CalculateSellingPrice(
            p.WeightInGrams, p.Purity, p.MetalType.ToString(),
            p.MakingChargePercent, p.WastagePercent, p.StonePrice, rates);

        return new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            SKU = p.SKU,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name,
            JewelleryType = p.JewelleryType.ToString(),
            MetalType = p.MetalType.ToString(),
            Purity = p.Purity,
            WeightInGrams = p.WeightInGrams,
            StoneType = p.StoneType.ToString(),
            StoneShape = p.StoneShape?.ToString(),
            StoneColor = p.StoneColor,
            StoneClarity = p.StoneClarity,
            StoneCarat = p.StoneCarat,
            MakingChargePercent = p.MakingChargePercent,
            WastagePercent = p.WastagePercent,
            StonePrice = p.StonePrice,
            SellingPrice = livePrice,
            DiscountPercent = p.DiscountPercent,
            StockQuantity = p.StockQuantity,
            ImageUrls = p.ImageUrls,
            ThreeDModelUrl = p.ThreeDModelUrl,
            IsFeatured = p.IsFeatured,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt
        };
    }
}

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string SKU { get; set; } = "";
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string JewelleryType { get; set; } = "";
    public string MetalType { get; set; } = "";
    public string Purity { get; set; } = "";
    public decimal WeightInGrams { get; set; }
    public string StoneType { get; set; } = "";
    public string? StoneShape { get; set; }
    public string? StoneColor { get; set; }
    public string? StoneClarity { get; set; }
    public decimal? StoneCarat { get; set; }
    public decimal MakingChargePercent { get; set; }
    public decimal WastagePercent { get; set; }
    public decimal StonePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public int StockQuantity { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? ThreeDModelUrl { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
