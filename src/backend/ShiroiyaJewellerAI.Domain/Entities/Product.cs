using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public JewelleryType JewelleryType { get; set; }
    public MetalType MetalType { get; set; }
    public string Purity { get; set; } = string.Empty; // e.g., "22K", "18K", "925"
    public decimal WeightInGrams { get; set; }
    public StoneType StoneType { get; set; }
    public StoneShape? StoneShape { get; set; }
    public string? StoneColor { get; set; }
    public string? StoneClarity { get; set; }
    public decimal? StoneCarat { get; set; }
    public decimal BasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public int StockQuantity { get; set; }
    public List<string> ImageUrls { get; set; } = new();
    public string? ThreeDModelUrl { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
}
