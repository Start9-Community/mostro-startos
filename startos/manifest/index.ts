import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'mostro',
  title: 'Mostro',
  license: 'mit',
  packageRepo: 'https://github.com/Start9-Community/mostro-startos',
  upstreamRepo: 'https://github.com/MostroP2P/mostro',
  marketingUrl: 'https://mostro.network/',
  donationUrl: 'https://geyser.fund/project/mostro',
  description: { short, long },
  volumes: ['main'],
  images: {
    mostro: {
      source: {
        dockerTag: 'mostrop2p/mostro:v0.18.0',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    lnd: {
      description: 'Lightning node',
      optional: false,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
