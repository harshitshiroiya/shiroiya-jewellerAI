using MediatR;

namespace ShiroiyaJewellerAI.Application.Features.Auth.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName
) : IRequest<AuthResponse>;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResponse>;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    string Email,
    string FirstName,
    string LastName,
    IList<string> Roles
);
