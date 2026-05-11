using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class Order : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Confirmed;
    public decimal SubTotal { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid ShippingAddressId { get; set; }
    public Address ShippingAddress { get; set; } = null!;
    public string? StripePaymentIntentId { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? AdminNotes { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
    public Payment? Payment { get; set; }
    public Invoice? Invoice { get; set; }
}
