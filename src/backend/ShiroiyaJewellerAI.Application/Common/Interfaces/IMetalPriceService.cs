namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IMetalPriceService
{
    Task<MetalRates> GetTodaysRatesAsync();
    decimal CalculateSellingPrice(decimal weightInGrams, string purity, string metalType, decimal makingChargePercent, decimal wastagePercent, decimal stonePrice, MetalRates rates);
}

public record MetalRates(
    decimal GoldPerGram,
    decimal SilverPerGram,
    DateTime FetchedAt);
