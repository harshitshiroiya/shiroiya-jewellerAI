namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IStripeService
{
    Task<PaymentIntentResult> CreatePaymentIntentAsync(decimal amount, string currency, string orderId);
    Task<PaymentIntentResult> GetPaymentIntentAsync(string paymentIntentId);
}

public record PaymentIntentResult(string PaymentIntentId, string ClientSecret, string Status);
