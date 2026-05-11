using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Infrastructure.Persistence;
using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CartController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var items = await _context.CartItems
            .Include(c => c.Product)
            .Include(c => c.CustomDesign)
            .Where(c => c.UserId == UserId)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var existing = await _context.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == UserId &&
            c.ProductId == request.ProductId &&
            c.CustomDesignId == request.CustomDesignId);

        if (existing != null)
        {
            existing.Quantity += request.Quantity;
        }
        else
        {
            decimal unitPrice = 0;
            if (request.ProductId.HasValue)
            {
                var product = await _context.Products.FindAsync(request.ProductId.Value);
                if (product == null) return NotFound("Product not found");
                unitPrice = product.SellingPrice;
            }
            else if (request.CustomDesignId.HasValue)
            {
                var design = await _context.CustomDesigns.FindAsync(request.CustomDesignId.Value);
                if (design == null) return NotFound("Custom design not found");
                unitPrice = design.EstimatedPrice;
            }

            var cartItem = new CartItem
            {
                UserId = UserId,
                ProductId = request.ProductId,
                CustomDesignId = request.CustomDesignId,
                Quantity = request.Quantity,
                UnitPrice = unitPrice
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuantity(Guid id, [FromBody] UpdateCartRequest request)
    {
        var item = await _context.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (item == null) return NotFound();

        if (request.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = request.Quantity;
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveFromCart(Guid id)
    {
        var item = await _context.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);
        if (item == null) return NotFound();

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var items = await _context.CartItems.Where(c => c.UserId == UserId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
        return Ok();
    }
}

public record AddToCartRequest(Guid? ProductId, Guid? CustomDesignId, int Quantity = 1);
public record UpdateCartRequest(int Quantity);
