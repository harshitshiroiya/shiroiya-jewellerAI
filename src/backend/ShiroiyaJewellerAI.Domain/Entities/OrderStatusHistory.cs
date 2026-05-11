using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public string? ChangedByUserId { get; set; }
    public string? Notes { get; set; }
}
