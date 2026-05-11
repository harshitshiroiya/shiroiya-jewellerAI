using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface IInvoiceService
{
    Task<Invoice> GenerateInvoiceAsync(Order order);
}
