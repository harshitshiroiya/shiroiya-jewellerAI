namespace ShiroiyaJewellerAI.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid? ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid? CustomDesignId { get; set; }
    public CustomDesign? CustomDesign { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string ProductSnapshot { get; set; } = "{}"; // JSON denormalized product data
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
}
