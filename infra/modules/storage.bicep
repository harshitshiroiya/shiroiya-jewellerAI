param location string
param envSuffix string

var storageName = replace('st${envSuffix}', '-', '')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'PUT', 'POST']
          allowedHeaders: ['*']
          exposedHeaders: ['*']
          maxAgeInSeconds: 3600
        }
      ]
    }
  }
}

var containers = ['product-images', '3d-models', 'certificates', 'invoices', 'ai-generated', 'user-uploads']

resource blobContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = [
  for containerName in containers: {
    parent: blobService
    name: containerName
    properties: {
      publicAccess: 'Blob'
    }
  }
]

output accountName string = storageAccount.name
output blobEndpoint string = storageAccount.properties.primaryEndpoints.blob
