using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public InvoiceService(ApplicationDbContext context, IBlobStorageService blobStorage)
    {
        _context = context;
        _blobStorage = blobStorage;
    }

    public async Task<Invoice> GenerateInvoiceAsync(Order order)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var cgst = order.TaxAmount / 2;
        var sgst = order.TaxAmount / 2;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("SHIROIYA JEWELLERS").FontSize(20).Bold();
                        col.Item().Text("Tax Invoice").FontSize(12).Italic();
                        col.Item().PaddingTop(5).Text($"Invoice #: {invoiceNumber}").FontSize(10);
                        col.Item().Text($"Date: {DateTime.UtcNow:dd MMM yyyy}").FontSize(10);
                        col.Item().Text($"Order: {order.OrderNumber}").FontSize(10);
                    });
                });

                page.Content().PaddingVertical(20).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Ship To:").Bold();
                            c.Item().Text($"{order.ShippingAddress.Line1}");
                            if (!string.IsNullOrEmpty(order.ShippingAddress.Line2))
                                c.Item().Text(order.ShippingAddress.Line2);
                            c.Item().Text($"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}");
                        });
                    });

                    col.Item().PaddingVertical(15).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(30);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("#").Bold();
                            header.Cell().Text("Item").Bold();
                            header.Cell().Text("Qty").Bold();
                            header.Cell().Text("Unit Price").Bold();
                            header.Cell().Text("Total").Bold();
                        });

                        var index = 1;
                        foreach (var item in order.OrderItems)
                        {
                            table.Cell().Text(index.ToString());
                            table.Cell().Text(item.ProductSnapshot.Length > 50 ? $"Item #{index}" : item.ProductSnapshot);
                            table.Cell().Text(item.Quantity.ToString());
                            table.Cell().Text($"₹{item.UnitPrice:N2}");
                            table.Cell().Text($"₹{item.TotalPrice:N2}");
                            index++;
                        }
                    });

                    col.Item().PaddingTop(10).AlignRight().Column(summary =>
                    {
                        summary.Item().Text($"Subtotal: ₹{order.SubTotal:N2}");
                        summary.Item().Text($"CGST (1.5%): ₹{cgst:N2}");
                        summary.Item().Text($"SGST (1.5%): ₹{sgst:N2}");
                        summary.Item().Text($"Shipping: ₹{order.ShippingCost:N2}");
                        summary.Item().PaddingTop(5).Text($"Total: ₹{order.TotalAmount:N2}").Bold().FontSize(14);
                    });
                });

                page.Footer().AlignCenter().Text("Thank you for shopping with Shiroiya Jewellers!").FontSize(10);
            });
        });

        var pdfBytes = document.GeneratePdf();
        var fileName = $"invoices/{invoiceNumber}.pdf";
        var pdfUrl = await _blobStorage.UploadAsync("documents", fileName, pdfBytes, "application/pdf");

        var invoice = new Invoice
        {
            OrderId = order.Id,
            InvoiceNumber = invoiceNumber,
            PdfUrl = pdfUrl,
            SubTotal = order.SubTotal,
            CGST = cgst,
            SGST = sgst,
            IGST = 0,
            TotalAmount = order.TotalAmount,
            GeneratedAt = DateTime.UtcNow
        };

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }
}
