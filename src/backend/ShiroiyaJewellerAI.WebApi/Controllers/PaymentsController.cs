using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;
using Stripe;
using Stripe.Events;

namespace ShiroiyaJewellerAI.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public PaymentsController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var webhookSecret = _configuration["Stripe:WebhookSecret"];

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret);

            if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent?.Metadata.TryGetValue("orderId", out var orderId) == true)
                {
                    var order = await _context.Orders
                        .Include(o => o.Payment)
                        .FirstOrDefaultAsync(o => o.Id == Guid.Parse(orderId));

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Succeeded;
                        if (order.Payment != null)
                        {
                            order.Payment.Status = PaymentStatus.Succeeded;
                            order.Payment.StripeChargeId = paymentIntent.LatestChargeId;
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }
            else if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                if (paymentIntent?.Metadata.TryGetValue("orderId", out var orderId) == true)
                {
                    var order = await _context.Orders
                        .Include(o => o.Payment)
                        .FirstOrDefaultAsync(o => o.Id == Guid.Parse(orderId));

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Failed;
                        if (order.Payment != null)
                            order.Payment.Status = PaymentStatus.Failed;
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }
}
