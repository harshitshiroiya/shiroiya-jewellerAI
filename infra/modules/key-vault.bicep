param location string
param envSuffix string

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-${envSuffix}'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

output vaultUri string = keyVault.properties.vaultUri
output vaultName string = keyVault.name
