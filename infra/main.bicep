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

module containerApps 'modules/container-apps.bicep' = {
  name: 'containerApps'
  params: {
    location: location
    envSuffix: envSuffix
    environment: environment
  }
}

module acr 'modules/acr.bicep' = {
  name: 'acr'
  params: {
    location: location
    envSuffix: envSuffix
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
    location: location
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
  params: {
    location: location
    envSuffix: envSuffix
  }
}

output containerAppsEnvironmentId string = containerApps.outputs.environmentId
output acrLoginServer string = acr.outputs.loginServer
output sqlServerFqdn string = sql.outputs.serverFqdn
output storageAccountName string = storage.outputs.accountName
