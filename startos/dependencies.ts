import { sdk } from './sdk'

const lnd = sdk.Dependency.required('lnd', {
  description: 'Lightning node',
  metadata: {
    title: 'LND',
    icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
  },
  versionRange: '>=0.21.1-beta:0',
  kind: 'running',
  healthChecks: ['sync-progress'],
})

export const dependencies = sdk.Dependencies.of().addDependency(lnd)
