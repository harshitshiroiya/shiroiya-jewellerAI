using System.Text.Json;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure.Persistence;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class CertificateService : ICertificateService
{
    private readonly ApplicationDbContext _context;
    private readonly IBlobStorageService _blobStorage;

    public CertificateService(ApplicationDbContext context, IBlobStorageService blobStorage)
    {
        _context = context;
        _blobStorage = blobStorage;
    }

    public async Task<Certificate> GenerateCertificateAsync(OrderItem orderItem, CertificateType type, string? metadata)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var certNumber = $"CERT-{type.ToString()[..3].ToUpper()}-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(50);

                page.Content().Column(col =>
                {
                    col.Item().AlignCenter().Text("CERTIFICATE OF AUTHENTICITY").FontSize(24).Bold();
                    col.Item().AlignCenter().PaddingTop(5).Text("Shiroiya Jewellers").FontSize(14);
                    col.Item().PaddingTop(30).LineHorizontal(1);

                    col.Item().PaddingTop(20).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Certificate No: {certNumber}").FontSize(12);
                            c.Item().PaddingTop(5).Text($"Type: {type}").FontSize(12);
                            c.Item().PaddingTop(5).Text($"Issue Date: {DateTime.UtcNow:dd MMMM yyyy}").FontSize(12);
                        });
                    });

                    col.Item().PaddingTop(20).Text("This certifies that the jewellery piece described herein has been examined and verified by our certified gemologists.").FontSize(11);

                    if (!string.IsNullOrEmpty(metadata))
                    {
                        col.Item().PaddingTop(15).Text("Specifications:").Bold().FontSize(12);
                        col.Item().PaddingTop(5).Text(metadata).FontSize(11);
                    }

                    col.Item().PaddingTop(40).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().LineHorizontal(1);
                            c.Item().PaddingTop(5).Text("Authorized Signatory").FontSize(10);
                        });
                        row.ConstantItem(200);
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().LineHorizontal(1);
                            c.Item().PaddingTop(5).Text("Chief Gemologist").FontSize(10);
                        });
                    });
                });
            });
        });

        var pdfBytes = document.GeneratePdf();
        var fileName = $"certificates/{certNumber}.pdf";
        var pdfUrl = await _blobStorage.UploadAsync("documents", fileName, pdfBytes, "application/pdf");

        var certificate = new Certificate
        {
            OrderItemId = orderItem.Id,
            CertificateType = type,
            CertificateNumber = certNumber,
            PdfUrl = pdfUrl,
            IssuedAt = DateTime.UtcNow,
            MetadataJson = metadata ?? "{}"
        };

        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();
        return certificate;
    }
}
