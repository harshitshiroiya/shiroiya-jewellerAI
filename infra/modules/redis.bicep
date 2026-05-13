param location string
param envSuffix string
param environment string

resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: 'redis-${envSuffix}'
  location: location
  properties: {
    sku: {
      name: environment == 'prod' ? 'Standard' : 'Basic'
      family: 'C'
      capacity: environment == 'prod' ? 1 : 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

output hostName string = redis.properties.hostName
output sslPort int = redis.properties.sslPort
