import {
  gRPCHostId as lndGrpcHostId,
  gRPCInterfaceId as lndGrpcInterfaceId,
} from 'lnd-startos/startos/interfaces'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { daemon_settings } from './fileModels/settings'
import { lndCredPaths, lndMount } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Mostro!'))

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  // LND's gRPC over the bridge — LND's StartOS-issued cert now covers the bridge
  // address, so mostro pins it (read via the idmap mount) and connects there.
  const lndGrpcUrl =
    (await sdk.host
      .get(
        effects,
        { hostId: lndGrpcHostId, packageId: 'lnd' },
        (host) => {
          const iface =
            host &&
            Object.values(host.bindings)
              .flatMap((b) => Object.values(b.interfaces))
              .find((i) => i.id === lndGrpcInterfaceId)
          return iface
            ? iface.addressInfo
                .filter({
                  kind: 'bridge',
                  predicate: (h) => h.ssl && h.metadata.kind === 'ipv4',
                })
                .format('urlstring')[0]
            : undefined
        },
      )
      .const()) ?? lndCredPaths.grpcHost

  await daemon_settings.merge(effects, {
    lightning: {
      lnd_cert_file: lndCredPaths.cert,
      lnd_macaroon_file: lndCredPaths.macaroon,
      lnd_grpc_host: lndGrpcUrl,
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
      // LND writes its creds as root (uid 0); remap to mostrouser (1000) so the
      // daemon reads tls.cert + admin.macaroon directly off the mount.
      idmap: [{ fromId: 0, toId: 1000 }],
    })

  const mostroSub = sdk.SubContainer.of(
    effects,
    { imageId: 'mostro' },
    mainMount,
    'mostro-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('prepare-runtime', {
      subcontainer: mostroSub,
      // Give mostrouser ownership of its own data volume. LND's creds are read
      // directly off the idmapped dependency mount — no copy needed.
      exec: {
        command: ['chown', '-R', 'mostrouser:mostrouser', '/mostro'],
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
