using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Application.Common.Interfaces;

public interface ITokenService
{
    Task<string> GenerateAccessTokenAsync(ApplicationUser user);
    string GenerateRefreshToken();
}
