targetScope = 'resourceGroup'

@description('Environment name')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region')
param location string = resourceGroup().location

@description('SQL Server admin password')
@secure()
param sqlAdminPassword string

@description('Project name prefix')
param projectName string = 'shiroiya'

var envSuffix = '${projectName}-${environment}'

module acr 'modules/acr.bicep' = {
  name: 'acr'
  params: {
    location: location
    envSuffix: envSuffix
  }
}

module containerApps 'modules/container-apps.bicep' = {
  name: 'containerApps'
  params: {
    location: location
    envSuffix: envSuffix
    environment: environment
  }
}

module sql 'modules/sql-server.bicep' = {
  name: 'sqlServer'
  params: {
    location: location
    envSuffix: envSuffix
    adminPassword: sqlAdminPassword
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    envSuffix: envSuffix
  }
}

module openai 'modules/cognitive-services.bicep' = {
  name: 'openai'
  params: {
    location: 'swedencentral'
    envSuffix: envSuffix
  }
}

module keyVault 'modules/key-vault.bicep' = {
  name: 'keyVault'
  params: {
    location: location
    envSuffix: envSuffix
  }
}

module appInsights 'modules/application-insights.bicep' = {
  name: 'appInsights'
  dependsOn: [containerApps]
  params: {
    location: location
    envSuffix: envSuffix
  }
}

module redis 'modules/redis.bicep' = {
  name: 'redis'
  params: {
    location: location
    envSuffix: envSuffix
    environment: environment
  }
}

output containerAppsEnvironmentId string = containerApps.outputs.environmentId
output apiFqdn string = containerApps.outputs.apiFqdn
output frontendFqdn string = containerApps.outputs.frontendFqdn
output acrLoginServer string = acr.outputs.loginServer
output acrName string = acr.outputs.acrName
output sqlServerFqdn string = sql.outputs.serverFqdn
output sqlDatabaseName string = sql.outputs.databaseName
output storageAccountName string = storage.outputs.accountName
output storageBlobEndpoint string = storage.outputs.blobEndpoint
output openaiEndpoint string = openai.outputs.endpoint
output keyVaultUri string = keyVault.outputs.vaultUri
output appInsightsConnectionString string = appInsights.outputs.connectionString
output redisHostName string = redis.outputs.hostName
