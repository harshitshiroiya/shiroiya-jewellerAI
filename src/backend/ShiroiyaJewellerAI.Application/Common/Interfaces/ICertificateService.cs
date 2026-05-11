using ShiroiyaJewellerAI.Domain.Entities;
using ShiroiyaJewellerAI.Domain.Enums;

namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface ICertificateService
{
    Task<Certificate> GenerateCertificateAsync(OrderItem orderItem, CertificateType type, string? metadata);
}
