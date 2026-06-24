import { i18n } from './i18n'
import { sdk } from './sdk'
import { daemon_settings } from './fileModels/settings'
import { lndCredPaths, lndMount } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Mostro!'))

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  await daemon_settings.merge(effects, {
    lightning: {
      lnd_cert_file: lndCredPaths.cert,
      lnd_macaroon_file: lndCredPaths.macaroon,
    },
    // Keep the admin RPC fixed on at localhost — it's Mostro's local-only admin
    // channel, never network-exposed.
    rpc: { enabled: true, listen_address: '127.0.0.1', port: 50051 },
  })

  // Re-run setupMain (restarting the daemon) whenever settings.toml changes, so
  // mostrod always picks up the latest config without a manual restart.
  await daemon_settings.read().const(effects)

  const mainMount = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mostro',
      readonly: false,
    })
    .mountDependency({
      dependencyId: 'lnd',
      volumeId: 'main',
      subpath: null,
      mountpoint: lndMount,
      readonly: true,
    })

  const mostroSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mostro' },
    mainMount,
    'mostro-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('prepare-runtime', {
      subcontainer: mostroSub,
      exec: {
        command: [
          'sh',
          '-c',
          [
            'set -e',
            `mkdir -p ${lndCredPaths.dir}`,
            `cp -f ${lndMount}/tls.cert ${lndCredPaths.cert}`,
            `macaroon="$(find ${lndMount} -name admin.macaroon -print -quit)"`,
            `if [ -z "$macaroon" ]; then echo "admin.macaroon not found under ${lndMount}" >&2; exit 1; fi`,
            `cp -f "$macaroon" ${lndCredPaths.macaroon}`,
            'chown -R mostrouser:mostrouser /mostro',
            `chmod 600 ${lndCredPaths.cert} ${lndCredPaths.macaroon}`,
          ].join('\n'),
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: mostroSub,
      exec: {
        command: ['mostrod', '-d', '/mostro'],
      },
      ready: {
        display: i18n('Mostro Daemon'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, 50051, {
            successMessage: i18n('Mostro is running'),
            errorMessage: i18n('Mostro is starting'),
          }),
      },
      requires: ['prepare-runtime'],
    })
})
