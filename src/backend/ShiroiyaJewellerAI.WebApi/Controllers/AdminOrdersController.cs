using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IInvoiceService _invoiceService;
    private readonly ICertificateService _certificateService;

    public AdminOrdersController(
        ApplicationDbContext context,
        IInvoiceService invoiceService,
        ICertificateService certificateService)
    {
        _context = context;
        _invoiceService = invoiceService;
        _certificateService = certificateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingAddress)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { items = orders, totalCount, page, pageSize });
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
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        var fromStatus = order.Status;
        order.Status = request.Status;
        order.AdminNotes = request.Notes;

        order.StatusHistory.Add(new OrderStatusHistory
        {
            FromStatus = fromStatus,
            ToStatus = request.Status,
            ChangedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier),
            Notes = request.Notes
        });

        await _context.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("{id:guid}/invoice")]
    public async Task<IActionResult> GenerateInvoice(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Invoice)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        if (order.Invoice != null) return Ok(order.Invoice);

        var invoice = await _invoiceService.GenerateInvoiceAsync(order);
        return Ok(invoice);
    }

    [HttpPost("{orderId:guid}/items/{itemId:guid}/certificate")]
    public async Task<IActionResult> GenerateCertificate(Guid orderId, Guid itemId, [FromBody] GenerateCertificateRequest request)
    {
        var orderItem = await _context.OrderItems
            .Include(oi => oi.Certificates)
            .FirstOrDefaultAsync(oi => oi.Id == itemId && oi.OrderId == orderId);

        if (orderItem == null) return NotFound();

        var certificate = await _certificateService.GenerateCertificateAsync(orderItem, request.CertificateType, request.Metadata);
        return Ok(certificate);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Orders.Where(o => o.PaymentStatus == PaymentStatus.Succeeded).SumAsync(o => o.TotalAmount);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Confirmed);
        var inProduction = await _context.Orders.CountAsync(o => o.Status == OrderStatus.InProduction);
        var totalProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalCustomers = await _context.Users.CountAsync();

        return Ok(new
        {
            totalOrders,
            totalRevenue,
            pendingOrders,
            inProduction,
            totalProducts,
            totalCustomers
        });
    }
}

public record UpdateOrderStatusRequest(OrderStatus Status, string? Notes);
public record GenerateCertificateRequest(CertificateType CertificateType, string? Metadata);
