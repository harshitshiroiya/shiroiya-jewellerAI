using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public string? StripeChargeId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "inr";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
}
