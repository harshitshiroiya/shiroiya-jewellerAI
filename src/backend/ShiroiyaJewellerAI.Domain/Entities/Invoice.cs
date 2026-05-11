namespace ShiroiyaJewellerAI.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string InvoiceNumber { get; set; } = string.Empty;
    public string? PdfUrl { get; set; }
    public string? GSTNumber { get; set; }
    public string? HSNSAC { get; set; }
    public decimal SubTotal { get; set; }
    public decimal CGST { get; set; }
    public decimal SGST { get; set; }
    public decimal IGST { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
