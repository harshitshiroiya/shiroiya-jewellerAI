using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Domain.Entities;

public class Certificate : BaseEntity
{
    public Guid OrderItemId { get; set; }
    public OrderItem OrderItem { get; set; } = null!;
    public CertificateType CertificateType { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string? PdfUrl { get; set; }
    public DateTime? IssuedAt { get; set; }
    public string MetadataJson { get; set; } = "{}";
}
