namespace ShiroiyaJewellerAI.Domain.Entities;

public class AIConversation : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public string MessagesJson { get; set; } = "[]";
    public List<Guid> RecommendedProductIds { get; set; } = new();
    public List<string> GeneratedImageUrls { get; set; } = new();
}
