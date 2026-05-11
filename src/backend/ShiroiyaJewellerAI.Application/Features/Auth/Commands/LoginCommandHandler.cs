using MediatR;
using Microsoft.AspNetCore.Identity;
using ShiroiyaJewellerAI.Application.Common.Interfaces;
using ShiroiyaJewellerAI.Domain.Entities;

namespace ShiroiyaJewellerAI.Application.Features.Auth.Commands;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
            throw new UnauthorizedAccessException("Invalid email or password.");

        var token = await _tokenService.GenerateAccessTokenAsync(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var roles = await _userManager.GetRolesAsync(user);

        return new AuthResponse(token, refreshToken, user.Email!, user.FirstName, user.LastName, roles);
    }
}
