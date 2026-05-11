using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class CustomDesign : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public JewelleryType BaseType { get; set; }
    public MetalType MetalType { get; set; }
    public string Purity { get; set; } = string.Empty;
    public StoneType StoneType { get; set; }
    public StoneShape? StoneShape { get; set; }
    public string? StoneColor { get; set; }
    public string? StoneClarity { get; set; }
    public decimal? StoneCarat { get; set; }
    public string ConfigurationJson { get; set; } = "{}";
    public string? PreviewImageUrl { get; set; }
    public decimal EstimatedPrice { get; set; }
    public CustomDesignStatus Status { get; set; } = CustomDesignStatus.Draft;
}
