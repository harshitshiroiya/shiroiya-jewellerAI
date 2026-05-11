using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.SKU).HasMaxLength(50).IsRequired();
        builder.HasIndex(p => p.SKU).IsUnique();
        builder.Property(p => p.BasePrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.SellingPrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.DiscountPercent).HasColumnType("decimal(5,2)");
        builder.Property(p => p.WeightInGrams).HasColumnType("decimal(10,3)");
        builder.Property(p => p.StoneCarat).HasColumnType("decimal(6,3)");
        builder.Property(p => p.ImageUrls).HasConversion(
            v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
            v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new()
        );
        builder.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
    }
}
