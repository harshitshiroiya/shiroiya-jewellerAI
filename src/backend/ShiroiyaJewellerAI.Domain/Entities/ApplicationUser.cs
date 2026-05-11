using Microsoft.AspNetCore.Identity;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<CustomDesign> CustomDesigns { get; set; } = new List<CustomDesign>();
    public ICollection<AIConversation> AIConversations { get; set; } = new List<AIConversation>();
}
