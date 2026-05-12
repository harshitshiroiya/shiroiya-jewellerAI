# Azure Deployment Setup

## Prerequisites

1. Azure subscription linked to `shiroiya11harshit@gmail.com`
2. Azure CLI installed (`az login`)
3. GitHub repository: `harshitshiroiya/shiroiya-jewellerAI`

## Step 1: Create Service Principal for GitHub Actions

Run these commands locally after `az login`:

```bash
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create a service principal with Contributor role
az ad sp create-for-rbac \
  --name "sp-shiroiya-github" \
  --role Contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --sdk-auth
```

Save the output JSON — you'll need `clientId`, `clientSecret`, `tenantId`.

## Step 2: Configure Federated Credentials (OIDC — recommended)

```bash
APP_ID=$(az ad sp list --display-name "sp-shiroiya-github" --query "[0].appId" -o tsv)

# For main branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:harshitshiroiya/shiroiya-jewellerAI:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# For workflow_dispatch (manual deploy)
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-environment-dev",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:harshitshiroiya/shiroiya-jewellerAI:environment:dev",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

## Step 3: Set GitHub Repository Secrets

Go to: https://github.com/harshitshiroiya/shiroiya-jewellerAI/settings/secrets/actions

Add these secrets:

| Secret | Value |
|--------|-------|
| `AZURE_CLIENT_ID` | The `appId` from the service principal |
| `AZURE_TENANT_ID` | Your Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID |
| `SQL_ADMIN_PASSWORD` | A strong password for SQL Server (min 8 chars, uppercase, lowercase, number, special) |

## Step 4: Run the Deployment

1. Go to **Actions** tab in GitHub
2. Select **"Deploy Infrastructure & Application"** workflow
3. Click **"Run workflow"**
4. Choose environment: `dev`
5. Click **Run workflow**

## What Gets Created

Resource Group: `rg-shiroiya-dev`

| Resource | Name | Purpose |
|----------|------|---------|
| SQL Server | `sql-shiroiya-dev` | Database server |
| SQL Database | `ShiroiyaJewellerAI` | Application database (DACPAC deployed) |
| Container Registry | `acrshiroiyadev` | Docker image store |
| Container Apps Env | `cae-shiroiya-dev` | Container orchestration |
| Container App (API) | `ca-api-shiroiya-dev` | .NET 9 backend |
| Container App (Frontend) | `ca-frontend-shiroiya-dev` | Angular/Nginx frontend |
| Storage Account | `stshiroiyadev` | Blob storage (images, PDFs) |
| Key Vault | `kv-shiroiya-dev` | Secrets management |
| OpenAI | `oai-shiroiya-dev` | GPT-4o + DALL-E 3 |
| Redis Cache | `redis-shiroiya-dev` | Caching layer |
| App Insights | `ai-shiroiya-dev` | Monitoring/APM |
| Log Analytics | `log-shiroiya-dev` | Centralized logging |

## Estimated Monthly Cost (Dev tier)

- SQL Server S2: ~$75/mo
- Container Apps (minimal): ~$10/mo
- Redis Basic C0: ~$16/mo
- Storage: ~$1/mo
- OpenAI: Pay per token
- App Insights: Free tier
- **Total: ~$100-120/mo** (dev, minimal usage)

## Triggering Deployments

- **Staging**: Automatic on push to `main`
- **Production**: Manual via workflow_dispatch or git tag `v*`
- **Dev**: Manual via "Deploy Infrastructure & Application" workflow
