using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.SubTotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TaxAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TaxPercent).HasColumnType("decimal(5,2)");
        builder.Property(o => o.ShippingCost).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId);
        builder.HasOne(o => o.ShippingAddress).WithMany().HasForeignKey(o => o.ShippingAddressId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.Payment).WithOne(p => p.Order).HasForeignKey<Payment>(p => p.OrderId);
        builder.HasOne(o => o.Invoice).WithOne(i => i.Order).HasForeignKey<Invoice>(i => i.OrderId);
    }
}
