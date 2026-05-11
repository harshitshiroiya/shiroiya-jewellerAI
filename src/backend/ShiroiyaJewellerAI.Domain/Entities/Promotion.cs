namespace ShiroiyaJewellerAI.Domain.Entities;

public class Promotion : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
    public int MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
}

public enum DiscountType
{
    Percentage,
    Flat
}
