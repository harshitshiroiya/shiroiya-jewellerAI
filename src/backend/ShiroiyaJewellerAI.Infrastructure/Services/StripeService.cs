using Microsoft.Extensions.Configuration;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using Stripe;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly PaymentIntentService _paymentIntentService;

    public StripeService(IConfiguration configuration)
    {
        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"];
        _paymentIntentService = new PaymentIntentService();
    }

    public async Task<PaymentIntentResult> CreatePaymentIntentAsync(decimal amount, string currency, string orderId)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency,
            Metadata = new Dictionary<string, string> { { "orderId", orderId } },
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true }
        };

        var intent = await _paymentIntentService.CreateAsync(options);
        return new PaymentIntentResult(intent.Id, intent.ClientSecret, intent.Status);
    }

    public async Task<PaymentIntentResult> GetPaymentIntentAsync(string paymentIntentId)
    {
        var intent = await _paymentIntentService.GetAsync(paymentIntentId);
        return new PaymentIntentResult(intent.Id, intent.ClientSecret, intent.Status);
    }
}
