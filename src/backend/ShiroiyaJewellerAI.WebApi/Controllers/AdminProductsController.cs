using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Create), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Product product)
    {
        var existing = await _context.Products.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.SKU = product.SKU;
        existing.CategoryId = product.CategoryId;
        existing.JewelleryType = product.JewelleryType;
        existing.MetalType = product.MetalType;
        existing.Purity = product.Purity;
        existing.WeightInGrams = product.WeightInGrams;
        existing.StoneType = product.StoneType;
        existing.StoneShape = product.StoneShape;
        existing.StoneColor = product.StoneColor;
        existing.StoneClarity = product.StoneClarity;
        existing.StoneCarat = product.StoneCarat;
        existing.BasePrice = product.BasePrice;
        existing.SellingPrice = product.SellingPrice;
        existing.DiscountPercent = product.DiscountPercent;
        existing.StockQuantity = product.StockQuantity;
        existing.ImageUrls = product.ImageUrls;
        existing.ThreeDModelUrl = product.ThreeDModelUrl;
        existing.IsFeatured = product.IsFeatured;
        existing.IsActive = product.IsActive;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        product.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
