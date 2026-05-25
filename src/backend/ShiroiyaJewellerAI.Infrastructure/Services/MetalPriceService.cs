using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using ShiroiyaJewellerAI.Application.Common.Interfaces;

namespace ShiroiyaJewellerAI.Infrastructure.Services;

public class MetalPriceService : IMetalPriceService
{
    private readonly ILogger<MetalPriceService> _logger;
    private readonly IMemoryCache _cache;
    private static readonly HttpClient Http = new();
    private const string CacheKey = "metal_rates";
    private const decimal TroyOunceToGrams = 31.1035m;

    private static readonly Dictionary<string, decimal> PurityFactors = new()
    {
        ["24K"] = 1.0m,
        ["22K"] = 22m / 24m,
        ["18K"] = 18m / 24m,
        ["14K"] = 14m / 24m,
        ["950"] = 1.0m,    // platinum purity
        ["925"] = 0.925m,  // sterling silver
        ["999"] = 1.0m,
    };

    public MetalPriceService(ILogger<MetalPriceService> logger, IMemoryCache cache)
    {
        _logger = logger;
        _cache = cache;
    }

    public async Task<MetalRates> GetTodaysRatesAsync()
    {
        if (_cache.TryGetValue(CacheKey, out MetalRates? cached) && cached != null)
            return cached;

        try
        {
            var goldTask = FetchPriceAsync("XAU");
            var silverTask = FetchPriceAsync("XAG");
            await Task.WhenAll(goldTask, silverTask);

            var goldPerOz = await goldTask;
            var silverPerOz = await silverTask;

            var rates = new MetalRates(
                GoldPerGram: Math.Round(goldPerOz / TroyOunceToGrams, 2),
                SilverPerGram: Math.Round(silverPerOz / TroyOunceToGrams, 2),
                FetchedAt: DateTime.UtcNow);

            _logger.LogInformation("Metal rates fetched — Gold: ₹{Gold}/g, Silver: ₹{Silver}/g", rates.GoldPerGram, rates.SilverPerGram);

            _cache.Set(CacheKey, rates, TimeSpan.FromHours(4));
            return rates;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch live metal rates, using fallback");
            return new MetalRates(
                GoldPerGram: 7200m,
                SilverPerGram: 95m,
                FetchedAt: DateTime.UtcNow);
        }
    }

    public decimal CalculateSellingPrice(decimal weightInGrams, string purity, string metalType, decimal makingChargePercent, decimal wastagePercent, decimal stonePrice, MetalRates rates)
    {
        var ratePerGram = metalType switch
        {
            "Gold" or "RoseGold" or "WhiteGold" => rates.GoldPerGram,
            "Silver" => rates.SilverPerGram,
            "Platinum" => rates.GoldPerGram * 1.1m,
            _ => rates.GoldPerGram
        };

        var purityFactor = PurityFactors.GetValueOrDefault(purity, 1.0m);
        var metalValue = weightInGrams * ratePerGram * purityFactor;
        var wastage = metalValue * (wastagePercent / 100m);
        var makingCharge = metalValue * (makingChargePercent / 100m);

        return Math.Round(metalValue + wastage + makingCharge + stonePrice, 0);
    }

    private static async Task<decimal> FetchPriceAsync(string symbol)
    {
        var response = await Http.GetFromJsonAsync<JsonElement>($"https://api.gold-api.com/price/{symbol}/INR");
        return response.GetProperty("price").GetDecimal();
    }
}
