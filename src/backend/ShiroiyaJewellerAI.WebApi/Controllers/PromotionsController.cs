using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PromotionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> ValidatePromo([FromBody] ValidatePromoRequest request)
    {
        var promo = await _context.Promotions.FirstOrDefaultAsync(p =>
            p.Code == request.Code &&
            p.IsActive &&
            p.ValidFrom <= DateTime.UtcNow &&
            p.ValidTo >= DateTime.UtcNow &&
            p.CurrentUsageCount < p.MaxUsageCount);

        if (promo == null) return BadRequest(new { message = "Invalid or expired promo code" });

        if (promo.MinOrderAmount.HasValue && request.OrderAmount < promo.MinOrderAmount.Value)
            return BadRequest(new { message = $"Minimum order amount is ₹{promo.MinOrderAmount.Value:N0}" });

        var discount = promo.DiscountType == DiscountType.Percentage
            ? request.OrderAmount * promo.DiscountValue / 100
            : promo.DiscountValue;

        return Ok(new { discount, discountType = promo.DiscountType.ToString(), discountValue = promo.DiscountValue });
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var promos = await _context.Promotions.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(promos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] Promotion promotion)
    {
        _context.Promotions.Add(promotion);
        await _context.SaveChangesAsync();
        return Ok(promotion);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Promotion promotion)
    {
        var existing = await _context.Promotions.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Code = promotion.Code;
        existing.Description = promotion.Description;
        existing.DiscountType = promotion.DiscountType;
        existing.DiscountValue = promotion.DiscountValue;
        existing.MinOrderAmount = promotion.MinOrderAmount;
        existing.ValidFrom = promotion.ValidFrom;
        existing.ValidTo = promotion.ValidTo;
        existing.IsActive = promotion.IsActive;
        existing.MaxUsageCount = promotion.MaxUsageCount;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var promo = await _context.Promotions.FindAsync(id);
        if (promo == null) return NotFound();
        _context.Promotions.Remove(promo);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record ValidatePromoRequest(string Code, decimal OrderAmount);
