# Shiroiya JewellerAI

## Project Overview
AI-powered jewellery e-commerce platform with 3D custom design studio.

## Tech Stack
- Backend: .NET 9, C#, Clean Architecture, EF Core, MediatR
- Frontend: Angular 21, Three.js, Tailwind CSS
- Database: Azure SQL Server
- Cloud: Azure Container Apps, Azure OpenAI, Blob Storage
- IaC: Bicep
- CI/CD: GitHub Actions
- Payment: Stripe

## Commands
- Backend build: `cd src/backend && dotnet build`
- Backend run: `cd src/backend/ShiroiyaJewellerAI.WebApi && dotnet run`
- Frontend build: `cd src/frontend && npx ng build`
- Frontend dev: `cd src/frontend && npx ng serve`
- Docker: `docker-compose up`
- Note: Use `export PATH="$HOME/.dotnet:$HOME/.npm-global/bin:$PATH"` before running commands

## Architecture
- `src/backend/ShiroiyaJewellerAI.Domain` - Entities, Enums, Interfaces (zero dependencies)
- `src/backend/ShiroiyaJewellerAI.Application` - CQRS handlers, DTOs, Validation
- `src/backend/ShiroiyaJewellerAI.Infrastructure` - EF Core, Azure services, Stripe
- `src/backend/ShiroiyaJewellerAI.WebApi` - Controllers, Middleware, DI
- `src/frontend/src/app/features/` - Lazy-loaded feature modules
- `infra/` - Bicep modules for Azure deployment
