using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
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
        if (minPrice.HasValue)
            query = query.Where(p => p.SellingPrice >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.SellingPrice <= maxPrice.Value);

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.SellingPrice),
            "price_desc" => query.OrderByDescending(p => p.SellingPrice),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync();
        var products = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new { items = products, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound();
        return Ok(product);
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var products = await _context.Products
            .Where(p => p.IsFeatured && p.IsActive)
            .Take(12)
            .ToListAsync();
        return Ok(products);
    }
}
