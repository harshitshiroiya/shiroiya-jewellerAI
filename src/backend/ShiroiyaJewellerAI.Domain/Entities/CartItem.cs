namespace ShiroiyaJewellerAI.Domain.Entities;

public class CartItem : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public Guid? ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid? CustomDesignId { get; set; }
    public CustomDesign? CustomDesign { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
}
