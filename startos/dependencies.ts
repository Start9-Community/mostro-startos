import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => ({
  lnd: {
    kind: 'running',
    versionRange: '>=0.20.1-beta:2',
    healthChecks: ['sync-progress'],
  },
}))
