using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ShiroiyaJewellerAI.Application;
using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;
using ShiroiyaJewellerAI.Infrastructure;
using ShiroiyaJewellerAI.Infrastructure.Persistence;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (app.Environment.IsDevelopment())
        await context.Database.EnsureCreatedAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roles = ["Admin", "Customer"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var adminEmail = "admin@shiroiya.ai";
    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Shiroiya",
            LastName = "Admin",
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(admin, "Admin@Shiroiya123!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
    }

    if (!await context.Products.AnyAsync())
    {
        var rings = new Category { Name = "Rings", Slug = "rings", DisplayOrder = 1 };
        var earrings = new Category { Name = "Earrings", Slug = "earrings", DisplayOrder = 2 };
        var necklaces = new Category { Name = "Necklaces", Slug = "necklaces", DisplayOrder = 3 };
        var bracelets = new Category { Name = "Bracelets", Slug = "bracelets", DisplayOrder = 4 };
        var pendants = new Category { Name = "Pendants", Slug = "pendants", DisplayOrder = 5 };
        var bangles = new Category { Name = "Bangles", Slug = "bangles", DisplayOrder = 6 };
        context.Categories.AddRange(rings, earrings, necklaces, bracelets, pendants, bangles);

        context.Products.AddRange(
            new Product { Name = "Eternal Solitaire Ring", Description = "A timeless 1-carat diamond solitaire set in 22K gold. Perfect for engagements.", SKU = "RNG-GLD-DIA-001", CategoryId = rings.Id, JewelleryType = JewelleryType.Ring, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 4.5m, StoneType = StoneType.Diamond, StoneCarat = 1.0m, StoneClarity = "VVS1", StoneColor = "D", MakingChargePercent = 12, WastagePercent = 3, StonePrice = 120000, BasePrice = 185000, SellingPrice = 0, StockQuantity = 5, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&h=600&fit=crop" } },
            new Product { Name = "Royal Heritage Band", Description = "Handcrafted 18K gold band with intricate Mughal-inspired engraving.", SKU = "RNG-GLD-NON-002", CategoryId = rings.Id, JewelleryType = JewelleryType.Ring, MetalType = MetalType.Gold, Purity = "18K", WeightInGrams = 6.2m, StoneType = StoneType.None, MakingChargePercent = 18, WastagePercent = 3, StonePrice = 0, BasePrice = 62000, SellingPrice = 0, StockQuantity = 8, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop" } },
            new Product { Name = "Platinum Promise Ring", Description = "Elegant platinum ring with a 0.5ct diamond halo setting.", SKU = "RNG-PLT-DIA-003", CategoryId = rings.Id, JewelleryType = JewelleryType.Ring, MetalType = MetalType.Platinum, Purity = "950", WeightInGrams = 5.0m, StoneType = StoneType.Diamond, StoneCarat = 0.5m, StoneClarity = "VS1", StoneColor = "E", MakingChargePercent = 15, WastagePercent = 2, StonePrice = 65000, BasePrice = 145000, SellingPrice = 0, StockQuantity = 3, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&h=600&fit=crop" } },
            new Product { Name = "Ruby Radiance Ring", Description = "Burmese ruby centre stone surrounded by diamond accents in rose gold.", SKU = "RNG-RSG-RBY-004", CategoryId = rings.Id, JewelleryType = JewelleryType.Ring, MetalType = MetalType.RoseGold, Purity = "18K", WeightInGrams = 3.8m, StoneType = StoneType.Ruby, StoneCarat = 1.2m, MakingChargePercent = 14, WastagePercent = 3, StonePrice = 55000, BasePrice = 95000, SellingPrice = 0, StockQuantity = 4, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1551408458-c44a0767a6b0?w=600&h=600&fit=crop" } },

            new Product { Name = "Diamond Chandelier Earrings", Description = "Stunning 2.4ct total diamond weight chandelier earrings in 18K white gold.", SKU = "EAR-WGD-DIA-001", CategoryId = earrings.Id, JewelleryType = JewelleryType.Earring, MetalType = MetalType.WhiteGold, Purity = "18K", WeightInGrams = 8.5m, StoneType = StoneType.Diamond, StoneCarat = 2.4m, StoneClarity = "VS2", StoneColor = "F", MakingChargePercent = 14, WastagePercent = 2, StonePrice = 220000, BasePrice = 320000, SellingPrice = 0, StockQuantity = 2, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop" } },
            new Product { Name = "Pearl Drop Earrings", Description = "South Sea pearls suspended from 22K gold hooks with diamond accents.", SKU = "EAR-GLD-PRL-002", CategoryId = earrings.Id, JewelleryType = JewelleryType.Earring, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 6.0m, StoneType = StoneType.Pearl, StoneCarat = 8.0m, MakingChargePercent = 12, WastagePercent = 2, StonePrice = 35000, BasePrice = 85000, SellingPrice = 0, StockQuantity = 6, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=600&fit=crop" } },
            new Product { Name = "Emerald Stud Earrings", Description = "Colombian emerald studs in platinum bezel settings.", SKU = "EAR-PLT-EMR-003", CategoryId = earrings.Id, JewelleryType = JewelleryType.Earring, MetalType = MetalType.Platinum, Purity = "950", WeightInGrams = 4.2m, StoneType = StoneType.Emerald, StoneCarat = 1.6m, MakingChargePercent = 15, WastagePercent = 2, StonePrice = 75000, BasePrice = 125000, SellingPrice = 0, StockQuantity = 4, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=600&h=600&fit=crop" } },
            new Product { Name = "Gold Jhumka Earrings", Description = "Traditional Indian jhumka earrings in 22K gold with temple design.", SKU = "EAR-GLD-NON-004", CategoryId = earrings.Id, JewelleryType = JewelleryType.Earring, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 12.0m, StoneType = StoneType.None, MakingChargePercent = 20, WastagePercent = 3, StonePrice = 0, BasePrice = 96000, SellingPrice = 0, StockQuantity = 7, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=600&h=600&fit=crop" } },

            new Product { Name = "Diamond Rivière Necklace", Description = "Graduated diamond necklace with 15ct total weight in platinum.", SKU = "NCK-PLT-DIA-001", CategoryId = necklaces.Id, JewelleryType = JewelleryType.Necklace, MetalType = MetalType.Platinum, Purity = "950", WeightInGrams = 28.0m, StoneType = StoneType.Diamond, StoneCarat = 15.0m, StoneClarity = "VS1", StoneColor = "E", MakingChargePercent = 10, WastagePercent = 2, StonePrice = 1800000, BasePrice = 2500000, SellingPrice = 0, StockQuantity = 1, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop" } },
            new Product { Name = "Gold Temple Necklace", Description = "Traditional South Indian temple necklace in 22K gold with ruby and emerald accents.", SKU = "NCK-GLD-RBY-002", CategoryId = necklaces.Id, JewelleryType = JewelleryType.Necklace, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 45.0m, StoneType = StoneType.Ruby, StoneCarat = 5.0m, MakingChargePercent = 14, WastagePercent = 3, StonePrice = 85000, BasePrice = 450000, SellingPrice = 0, StockQuantity = 2, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=600&fit=crop" } },
            new Product { Name = "Sapphire Pendant Necklace", Description = "Ceylon sapphire pendant on a delicate 18K white gold chain.", SKU = "NCK-WGD-SPH-003", CategoryId = necklaces.Id, JewelleryType = JewelleryType.Necklace, MetalType = MetalType.WhiteGold, Purity = "18K", WeightInGrams = 8.5m, StoneType = StoneType.Sapphire, StoneCarat = 3.0m, MakingChargePercent = 12, WastagePercent = 2, StonePrice = 95000, BasePrice = 185000, SellingPrice = 0, StockQuantity = 3, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1515562141589-67f0d93e77b4?w=600&h=600&fit=crop" } },

            new Product { Name = "Diamond Tennis Bracelet", Description = "Classic tennis bracelet with 5ct diamonds in 18K white gold.", SKU = "BRC-WGD-DIA-001", CategoryId = bracelets.Id, JewelleryType = JewelleryType.Bracelet, MetalType = MetalType.WhiteGold, Purity = "18K", WeightInGrams = 15.0m, StoneType = StoneType.Diamond, StoneCarat = 5.0m, StoneClarity = "VS2", StoneColor = "G", MakingChargePercent = 12, WastagePercent = 2, StonePrice = 450000, BasePrice = 650000, SellingPrice = 0, StockQuantity = 2, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop" } },
            new Product { Name = "Gold Charm Bracelet", Description = "22K gold link bracelet with traditional Indian motif charms.", SKU = "BRC-GLD-NON-002", CategoryId = bracelets.Id, JewelleryType = JewelleryType.Bracelet, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 18.0m, StoneType = StoneType.None, MakingChargePercent = 16, WastagePercent = 3, StonePrice = 0, BasePrice = 144000, SellingPrice = 0, StockQuantity = 5, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop" } },

            new Product { Name = "Kundan Bridal Bangle Set", Description = "Set of 4 kundan bangles in 22K gold with uncut diamonds and pearls.", SKU = "BNG-GLD-DIA-001", CategoryId = bangles.Id, JewelleryType = JewelleryType.Bangle, MetalType = MetalType.Gold, Purity = "22K", WeightInGrams = 65.0m, StoneType = StoneType.Diamond, StoneCarat = 4.0m, MakingChargePercent = 14, WastagePercent = 3, StonePrice = 150000, BasePrice = 580000, SellingPrice = 0, StockQuantity = 2, IsFeatured = true, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&h=600&fit=crop" } },
            new Product { Name = "Silver Filigree Bangles", Description = "Pair of oxidized silver bangles with Rajasthani filigree work.", SKU = "BNG-SLV-NON-002", CategoryId = bangles.Id, JewelleryType = JewelleryType.Bangle, MetalType = MetalType.Silver, Purity = "925", WeightInGrams = 40.0m, StoneType = StoneType.None, MakingChargePercent = 25, WastagePercent = 3, StonePrice = 0, BasePrice = 12000, SellingPrice = 0, StockQuantity = 15, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=600&fit=crop" } },

            new Product { Name = "Diamond Heart Pendant", Description = "Heart-shaped pendant with pavé diamonds in 18K rose gold.", SKU = "PND-RSG-DIA-001", CategoryId = pendants.Id, JewelleryType = JewelleryType.Pendant, MetalType = MetalType.RoseGold, Purity = "18K", WeightInGrams = 3.2m, StoneType = StoneType.Diamond, StoneCarat = 0.8m, StoneClarity = "VS1", MakingChargePercent = 14, WastagePercent = 2, StonePrice = 48000, BasePrice = 78000, SellingPrice = 0, StockQuantity = 6, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&h=600&fit=crop" } },
            new Product { Name = "Emerald Drop Pendant", Description = "Pear-shaped Colombian emerald pendant with diamond surround in platinum.", SKU = "PND-PLT-EMR-002", CategoryId = pendants.Id, JewelleryType = JewelleryType.Pendant, MetalType = MetalType.Platinum, Purity = "950", WeightInGrams = 5.0m, StoneType = StoneType.Emerald, StoneCarat = 2.5m, MakingChargePercent = 12, WastagePercent = 2, StonePrice = 125000, BasePrice = 210000, SellingPrice = 0, StockQuantity = 2, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=600&fit=crop" } }
        );

        await context.SaveChangesAsync();
    }
}

app.Run();
