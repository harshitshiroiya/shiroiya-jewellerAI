using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IStripeService _stripeService;

    public OrdersController(ApplicationDbContext context, IStripeService stripeService)
    {
        _context = context;
        _stripeService = stripeService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.UserId == UserId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Certificates)
            .Include(o => o.StatusHistory)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Payment)
            .Include(o => o.Invoice)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var cartItems = await _context.CartItems
            .Include(c => c.Product)
            .Include(c => c.CustomDesign)
            .Where(c => c.UserId == UserId)
            .ToListAsync();

        if (cartItems.Count == 0) return BadRequest("Cart is empty");

        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId && a.UserId == UserId);
        if (address == null) return BadRequest("Invalid shipping address");

        var subTotal = cartItems.Sum(c => c.UnitPrice * c.Quantity);
        var taxPercent = 3m;
        var taxAmount = subTotal * taxPercent / 100;
        var shippingCost = subTotal > 50000 ? 0 : 500;
        var totalAmount = subTotal + taxAmount + shippingCost;

        if (!string.IsNullOrEmpty(request.PromoCode))
        {
            var promo = await _context.Promotions.FirstOrDefaultAsync(p =>
                p.Code == request.PromoCode && p.IsActive &&
                p.ValidFrom <= DateTime.UtcNow && p.ValidTo >= DateTime.UtcNow &&
                p.CurrentUsageCount < p.MaxUsageCount &&
                (!p.MinOrderAmount.HasValue || subTotal >= p.MinOrderAmount.Value));

            if (promo != null)
            {
                var discount = promo.DiscountType == DiscountType.Percentage
                    ? subTotal * promo.DiscountValue / 100
                    : promo.DiscountValue;
                totalAmount -= discount;
                promo.CurrentUsageCount++;
            }
        }

        var order = new Order
        {
            UserId = UserId,
            OrderNumber = $"SJ-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            Status = OrderStatus.Confirmed,
            SubTotal = subTotal,
            TaxPercent = taxPercent,
            TaxAmount = taxAmount,
            ShippingCost = shippingCost,
            TotalAmount = totalAmount,
            ShippingAddressId = address.Id,
            PaymentStatus = PaymentStatus.Pending
        };

        foreach (var item in cartItems)
        {
            var snapshot = item.Product != null
                ? JsonSerializer.Serialize(new { item.Product.Name, item.Product.SKU, item.Product.MetalType, item.Product.SellingPrice, item.Product.ImageUrls })
                : JsonSerializer.Serialize(new { Name = "Custom Design", item.CustomDesign?.BaseType, item.CustomDesign?.MetalType, item.CustomDesign?.EstimatedPrice });

            order.OrderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                CustomDesignId = item.CustomDesignId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.UnitPrice * item.Quantity,
                ProductSnapshot = snapshot
            });
        }

        order.StatusHistory.Add(new OrderStatusHistory
        {
            FromStatus = OrderStatus.Confirmed,
            ToStatus = OrderStatus.Confirmed,
            Notes = "Order placed successfully"
        });

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        var paymentResult = await _stripeService.CreatePaymentIntentAsync(totalAmount, "inr", order.Id.ToString());

        order.StripePaymentIntentId = paymentResult.PaymentIntentId;
        order.Payment = new Payment
        {
            OrderId = order.Id,
            StripePaymentIntentId = paymentResult.PaymentIntentId,
            Amount = totalAmount,
            Currency = "inr",
            Status = PaymentStatus.Pending
        };
        await _context.SaveChangesAsync();

        return Ok(new
        {
            order.Id,
            order.OrderNumber,
            order.TotalAmount,
            ClientSecret = paymentResult.ClientSecret
        });
    }

    [HttpPost("{id:guid}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);

        if (order == null) return NotFound();

        if (!string.IsNullOrEmpty(order.StripePaymentIntentId))
        {
            var result = await _stripeService.GetPaymentIntentAsync(order.StripePaymentIntentId);
            if (result.Status == "succeeded")
            {
                order.PaymentStatus = PaymentStatus.Succeeded;
                if (order.Payment != null)
                    order.Payment.Status = PaymentStatus.Succeeded;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { order.PaymentStatus });
    }
}

public record CreateOrderRequest(Guid ShippingAddressId, string? PromoCode);
