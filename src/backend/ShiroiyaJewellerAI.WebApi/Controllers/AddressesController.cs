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
public class AddressesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AddressesController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var addresses = await _context.Addresses
            .Where(a => a.UserId == UserId)
            .OrderByDescending(a => a.IsDefault)
            .ToListAsync();
        return Ok(addresses);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressRequest request)
    {
        if (request.IsDefault)
        {
            var existing = await _context.Addresses
                .Where(a => a.UserId == UserId && a.IsDefault)
                .ToListAsync();
            foreach (var addr in existing) addr.IsDefault = false;
        }

        var address = new Address
        {
            UserId = UserId,
            Label = request.Label,
            Line1 = request.Line1,
            Line2 = request.Line2,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            IsDefault = request.IsDefault
        };

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();
        return Ok(address);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] CreateAddressRequest request)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == UserId);
        if (address == null) return NotFound();

        if (request.IsDefault)
        {
            var existing = await _context.Addresses
                .Where(a => a.UserId == UserId && a.IsDefault && a.Id != id)
                .ToListAsync();
            foreach (var addr in existing) addr.IsDefault = false;
        }

        address.Label = request.Label;
        address.Line1 = request.Line1;
        address.Line2 = request.Line2;
        address.City = request.City;
        address.State = request.State;
        address.PostalCode = request.PostalCode;
        address.Country = request.Country;
        address.IsDefault = request.IsDefault;

        await _context.SaveChangesAsync();
        return Ok(address);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == UserId);
        if (address == null) return NotFound();

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return Ok();
    }
}

public record CreateAddressRequest(
    string Label,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    bool IsDefault = false);
